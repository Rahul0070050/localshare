import { h } from 'preact';
import { useState, useRef, useEffect, useCallback, useMemo } from 'preact/hooks';
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeMutedIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  PipIcon,
  SubtitlesIcon,
  SettingsIcon,
  InfoIcon,
  CheckIcon,
} from './VideoIcons';

interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  onClose?: () => void;
}

interface SubtitleTrack {
  id: string;
  label: string;
  src: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekTrackRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('localshare_video_vol');
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);

  // Controls visibility & interaction
  const [showControls, setShowControls] = useState(true);
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverX, setHoverX] = useState(0);
  const [isDraggingSeek, setIsDraggingSeek] = useState(false);

  // Center ripple animation
  const [centerAnimation, setCenterAnimation] = useState<'play' | 'pause' | '+10' | '-10' | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Subtitles
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState<string>('off');
  const [subtitleSize, setSubtitleSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Video resolution metadata
  const [meta, setMeta] = useState<{ width: number; height: number; quality: string; ratio: string } | null>(null);

  // Settings popover
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'main' | 'speed' | 'subtitles' | 'info' | 'shortcuts'>('main');

  // Check PiP capability on mount
  useEffect(() => {
    if (typeof document !== 'undefined' && 'pictureInPictureEnabled' in document) {
      setIsPiPSupported(true);
    }
  }, []);

  // Format time (00:00 or 00:00:00)
  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const mm = m < 10 ? `0${m}` : `${m}`;
    const ss = s < 10 ? `0${s}` : `${s}`;

    if (h > 0) {
      const hh = h < 10 ? `0${h}` : `${h}`;
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  }, []);

  // Show transient feedback toast
  const triggerToast = useCallback((msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast((prev) => (prev === msg ? null : prev));
    }, 1500);
  }, []);

  // Center animation trigger
  const triggerCenterAnim = useCallback((type: 'play' | 'pause' | '+10' | '-10') => {
    setCenterAnimation(type);
    setTimeout(() => {
      setCenterAnimation((prev) => (prev === type ? null : prev));
    }, 500);
  }, []);

  // Toggle play / pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
      triggerCenterAnim('play');
    } else {
      video.pause();
      setIsPlaying(false);
      triggerCenterAnim('pause');
    }
  }, [triggerCenterAnim]);

  // Skip time forward / backward
  const skip = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;

      const target = Math.max(0, Math.min(duration, video.currentTime + seconds));
      video.currentTime = target;
      setCurrentTime(target);
      triggerCenterAnim(seconds > 0 ? '+10' : '-10');
      triggerToast(`${seconds > 0 ? '+10s' : '-10s'} (${formatTime(target)})`);
    },
    [duration, formatTime, triggerCenterAnim, triggerToast]
  );

  // Volume & Mute
  const changeVolume = useCallback((newVol: number) => {
    const video = videoRef.current;
    if (!video) return;

    const clamped = Math.max(0, Math.min(1, newVol));
    video.volume = clamped;
    video.muted = clamped === 0;
    setVolume(clamped);
    setIsMuted(clamped === 0);
    localStorage.setItem('localshare_video_vol', clamped.toString());
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted || volume === 0) {
      const restore = volume === 0 ? 0.7 : volume;
      video.muted = false;
      video.volume = restore;
      setIsMuted(false);
      setVolume(restore);
      triggerToast(`Volume: ${Math.round(restore * 100)}%`);
    } else {
      video.muted = true;
      setIsMuted(true);
      triggerToast('Muted');
    }
  }, [isMuted, volume, triggerToast]);

  // Playback Rate
  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    triggerToast(`Speed: ${rate}x`);
  }, [triggerToast]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // PiP
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP failed:', e);
    }
  }, []);

  // Auto-hide controls timer
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    if (isPlaying && !isSettingsOpen) {
      hideTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, isSettingsOpen]);

  // Fullscreen listener
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Video Events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (!isDraggingSeek) {
        setCurrentTime(video.currentTime);
      }
      if (video.buffered.length > 0) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1));
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      const w = video.videoWidth;
      const h = video.videoHeight;
      let q = `${h}p`;
      if (h >= 2160) q = '4K UHD';
      else if (h >= 1440) q = '1440p QHD';
      else if (h >= 1080) q = '1080p FHD';
      else if (h >= 720) q = '720p HD';
      else if (h >= 480) q = '480p SD';

      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(w, h);
      const ratio = `${w / divisor}:${h / divisor}`;

      setMeta({ width: w, height: h, quality: q, ratio });
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [isDraggingSeek]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          changeVolume(volume + 0.05);
          triggerToast(`Volume: ${Math.round(Math.min(1, volume + 0.05) * 100)}%`);
          break;
        case 'arrowdown':
          e.preventDefault();
          changeVolume(volume - 0.05);
          triggerToast(`Volume: ${Math.round(Math.max(0, volume - 0.05) * 100)}%`);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'p':
          e.preventDefault();
          togglePiP();
          break;
        case 'c':
          e.preventDefault();
          toggleSubtitles();
          break;
        case '>':
          e.preventDefault();
          {
            const nextIdx = SPEED_OPTIONS.findIndex((s) => s > playbackRate);
            if (nextIdx !== -1) changePlaybackRate(SPEED_OPTIONS[nextIdx]);
          }
          break;
        case '<':
          e.preventDefault();
          {
            const prevOptions = SPEED_OPTIONS.filter((s) => s < playbackRate);
            if (prevOptions.length > 0) changePlaybackRate(prevOptions[prevOptions.length - 1]);
          }
          break;
      }
      resetHideTimer();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    skip,
    changeVolume,
    toggleMute,
    toggleFullscreen,
    togglePiP,
    playbackRate,
    volume,
    changePlaybackRate,
    resetHideTimer,
  ]);

  // Subtitle Toggle
  const toggleSubtitles = useCallback(() => {
    const video = videoRef.current;
    if (!video || subtitles.length === 0) {
      triggerToast('No subtitles loaded. Use Settings to load .srt/.vtt');
      return;
    }

    const nextMode = activeSubtitle === 'off' ? subtitles[0].id : 'off';
    setActiveSubtitle(nextMode);

    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode = video.textTracks[i].id === nextMode ? 'showing' : 'hidden';
    }
    triggerToast(nextMode === 'off' ? 'Subtitles Off' : `Subtitles: ${subtitles[0].label}`);
  }, [activeSubtitle, subtitles, triggerToast]);

  // Load Subtitle File (SRT or VTT)
  const handleLoadSubtitleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let content = (e.target?.result as string) || '';

      // Auto-convert SRT to WebVTT format
      if (file.name.endsWith('.srt')) {
        content =
          'WEBVTT\n\n' +
          content
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
      }

      const blob = new Blob([content], { type: 'text/vtt' });
      const blobUrl = URL.createObjectURL(blob);
      const newTrack: SubtitleTrack = {
        id: `track-${Date.now()}`,
        label: file.name.replace(/\.[^/.]+$/, ''),
        src: blobUrl,
      };

      setSubtitles((prev) => [...prev, newTrack]);
      setActiveSubtitle(newTrack.id);

      // Add to video element
      const video = videoRef.current;
      if (video) {
        const trackEl = document.createElement('track');
        trackEl.kind = 'subtitles';
        trackEl.label = newTrack.label;
        trackEl.src = newTrack.src;
        trackEl.default = true;
        trackEl.id = newTrack.id;
        video.appendChild(trackEl);
        trackEl.track.mode = 'showing';
      }

      triggerToast(`Loaded: ${file.name}`);
      setIsSettingsOpen(false);
    };
    reader.readAsText(file);
  }, [triggerToast]);

  // Seek bar interaction (Scrubbing / Dragging)
  const handleSeekMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const track = seekTrackRef.current;
      if (!track || !duration) return;

      const rect = track.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = offsetX / rect.width;
      const time = percent * duration;

      setHoverTime(time);
      setHoverX(offsetX);

      if (isDraggingSeek && videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    },
    [duration, isDraggingSeek]
  );

  const handleSeekStart = useCallback(
    (e: MouseEvent) => {
      setIsDraggingSeek(true);
      handleSeekMove(e);

      const onMove = (ev: MouseEvent) => handleSeekMove(ev);
      const onUp = () => {
        setIsDraggingSeek(false);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [handleSeekMove]
  );

  const seekProgressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      class={`vp-container ${isFullscreen ? 'fullscreen' : ''} ${!showControls && isPlaying ? 'controls-hidden' : ''}`}
      onMouseMove={resetHideTimer}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      tabIndex={0}
    >
      {/* Hidden File Input for Subtitles */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".vtt,.srt"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleLoadSubtitleFile(file);
        }}
      />

      {/* Video Element */}
      <video
        ref={videoRef}
        class={`vp-video subtitle-size-${subtitleSize}`}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onDblClick={toggleFullscreen}
      />

      {/* Center Action Feedback Ripple */}
      {centerAnimation && (
        <div class="vp-center-flash">
          <div class="vp-center-icon-wrap">
            {centerAnimation === 'play' && <PlayIcon size={40} />}
            {centerAnimation === 'pause' && <PauseIcon size={40} />}
            {centerAnimation === '+10' && <span>+10s</span>}
            {centerAnimation === '-10' && <span>-10s</span>}
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {feedbackToast && (
        <div class="vp-toast">
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Video Quality Badge (Top Left) */}
      {meta && (
        <div class="vp-badge-overlay">
          <span class="vp-quality-pill">{meta.quality}</span>
          <span class="vp-title-pill">{title}</span>
        </div>
      )}

      {/* Settings Popover Menu */}
      {isSettingsOpen && (
        <div class="vp-settings-popover" onClick={(e) => e.stopPropagation()}>
          <div class="vp-settings-header">
            {settingsTab !== 'main' && (
              <button class="vp-settings-back-btn" onClick={() => setSettingsTab('main')}>
                ←
              </button>
            )}
            <span class="vp-settings-title">
              {settingsTab === 'main' && 'Playback Settings'}
              {settingsTab === 'speed' && 'Playback Speed'}
              {settingsTab === 'subtitles' && 'Subtitles'}
              {settingsTab === 'info' && 'Video Information'}
              {settingsTab === 'shortcuts' && 'Keyboard Shortcuts'}
            </span>
          </div>

          <div class="vp-settings-body">
            {settingsTab === 'main' && (
              <div class="vp-settings-list">
                <button class="vp-settings-row" onClick={() => setSettingsTab('speed')}>
                  <span>Speed</span>
                  <span class="vp-settings-val">{playbackRate === 1 ? 'Normal' : `${playbackRate}x`} →</span>
                </button>

                <button class="vp-settings-row" onClick={() => setSettingsTab('subtitles')}>
                  <span>Subtitles</span>
                  <span class="vp-settings-val">
                    {activeSubtitle === 'off' ? 'Off' : subtitles.find((s) => s.id === activeSubtitle)?.label || 'On'} →
                  </span>
                </button>

                <button class="vp-settings-row" onClick={() => setSettingsTab('info')}>
                  <span>Video Details</span>
                  <span class="vp-settings-val">{meta ? meta.quality : '—'} →</span>
                </button>

                <button class="vp-settings-row" onClick={() => setSettingsTab('shortcuts')}>
                  <span>Shortcuts</span>
                  <span class="vp-settings-val">View →</span>
                </button>
              </div>
            )}

            {settingsTab === 'speed' && (
              <div class="vp-settings-list">
                {SPEED_OPTIONS.map((rate) => (
                  <button
                    key={rate}
                    class={`vp-settings-row ${playbackRate === rate ? 'active' : ''}`}
                    onClick={() => {
                      changePlaybackRate(rate);
                      setSettingsTab('main');
                    }}
                  >
                    <span>{rate === 1 ? '1.0x (Normal)' : `${rate}x`}</span>
                    {playbackRate === rate && <CheckIcon size={16} />}
                  </button>
                ))}
              </div>
            )}

            {settingsTab === 'subtitles' && (
              <div class="vp-settings-list">
                <button
                  class={`vp-settings-row ${activeSubtitle === 'off' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSubtitle('off');
                    if (videoRef.current) {
                      for (let i = 0; i < videoRef.current.textTracks.length; i++) {
                        videoRef.current.textTracks[i].mode = 'hidden';
                      }
                    }
                  }}
                >
                  <span>Off</span>
                  {activeSubtitle === 'off' && <CheckIcon size={16} />}
                </button>

                {subtitles.map((sub) => (
                  <button
                    key={sub.id}
                    class={`vp-settings-row ${activeSubtitle === sub.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSubtitle(sub.id);
                      if (videoRef.current) {
                        for (let i = 0; i < videoRef.current.textTracks.length; i++) {
                          videoRef.current.textTracks[i].mode =
                            videoRef.current.textTracks[i].id === sub.id ? 'showing' : 'hidden';
                        }
                      }
                    }}
                  >
                    <span>{sub.label}</span>
                    {activeSubtitle === sub.id && <CheckIcon size={16} />}
                  </button>
                ))}

                <button
                  class="vp-settings-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  + Load Subtitle File (.vtt / .srt)
                </button>

                <div class="vp-subtitle-size-row">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Text Size:</span>
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      class={`vp-size-chip ${subtitleSize === sz ? 'active' : ''}`}
                      onClick={() => setSubtitleSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {settingsTab === 'info' && meta && (
              <div class="vp-info-sheet">
                <div class="vp-info-item">
                  <span class="vp-info-label">Resolution</span>
                  <span class="vp-info-value">{meta.width} × {meta.height} ({meta.quality})</span>
                </div>
                <div class="vp-info-item">
                  <span class="vp-info-label">Aspect Ratio</span>
                  <span class="vp-info-value">{meta.ratio}</span>
                </div>
                <div class="vp-info-item">
                  <span class="vp-info-label">Duration</span>
                  <span class="vp-info-value">{formatTime(duration)}</span>
                </div>
                <div class="vp-info-item">
                  <span class="vp-info-label">Buffer Stream</span>
                  <span class="vp-info-value">HTTP 206 Partial Content (Fast Seek)</span>
                </div>
              </div>
            )}

            {settingsTab === 'shortcuts' && (
              <div class="vp-shortcuts-table">
                <div class="vp-sc-row"><kbd>Space</kbd> / <kbd>K</kbd> <span>Play / Pause</span></div>
                <div class="vp-sc-row"><kbd>←</kbd> / <kbd>→</kbd> <span>Seek ±10s</span></div>
                <div class="vp-sc-row"><kbd>↑</kbd> / <kbd>↓</kbd> <span>Volume ±5%</span></div>
                <div class="vp-sc-row"><kbd>M</kbd> <span>Mute Toggle</span></div>
                <div class="vp-sc-row"><kbd>F</kbd> <span>Fullscreen</span></div>
                <div class="vp-sc-row"><kbd>P</kbd> <span>Picture-in-Picture</span></div>
                <div class="vp-sc-row"><kbd>C</kbd> <span>Subtitles Toggle</span></div>
                <div class="vp-sc-row"><kbd>&lt;</kbd> / <kbd>&gt;</kbd> <span>Playback Speed</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Bar Overlay */}
      <div class={`vp-controls-bar ${showControls ? 'visible' : 'hidden'}`} onClick={(e) => e.stopPropagation()}>
        {/* Interactive Seek Bar */}
        <div
          ref={seekTrackRef}
          class="vp-seek-track"
          onMouseDown={handleSeekStart}
          onMouseEnter={() => setIsHoveringSeek(true)}
          onMouseLeave={() => setIsHoveringSeek(false)}
          onMouseMove={handleSeekMove}
        >
          {/* Hover Timestamp Tooltip */}
          {isHoveringSeek && duration > 0 && (
            <div class="vp-seek-tooltip" style={{ left: `${hoverX}px` }}>
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Buffered Background Bar */}
          <div class="vp-seek-buffered" style={{ width: `${bufferedPercent}%` }} />

          {/* Played Progress Bar */}
          <div class="vp-seek-played" style={{ width: `${seekProgressPercent}%` }}>
            <div class="vp-seek-thumb" />
          </div>
        </div>

        {/* Buttons Row */}
        <div class="vp-controls-row">
          {/* Left Group */}
          <div class="vp-left-group">
            <button class="vp-btn" onClick={togglePlay} title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
              {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>

            <button class="vp-btn" onClick={() => skip(-10)} title="Skip 10s backward (Left Arrow)">
              <SkipBackIcon size={20} />
            </button>

            <button class="vp-btn" onClick={() => skip(10)} title="Skip 10s forward (Right Arrow)">
              <SkipForwardIcon size={20} />
            </button>

            {/* Volume Control */}
            <div class="vp-volume-wrapper">
              <button class="vp-btn" onClick={toggleMute} title={isMuted ? 'Unmute (M)' : 'Mute (M)'}>
                {isMuted || volume === 0 ? (
                  <VolumeMutedIcon size={20} />
                ) : volume < 0.5 ? (
                  <VolumeLowIcon size={20} />
                ) : (
                  <VolumeHighIcon size={20} />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                class="vp-volume-slider"
                value={isMuted ? 0 : volume}
                onInput={(e) => changeVolume(parseFloat((e.target as HTMLInputElement).value))}
              />
            </div>

            {/* Timestamp */}
            <div class="vp-time-display">
              <span class="vp-time-current">{formatTime(currentTime)}</span>
              <span class="vp-time-divider">/</span>
              <span class="vp-time-total">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Group */}
          <div class="vp-right-group">
            {/* Speed Badge */}
            <button
              class="vp-btn vp-speed-btn"
              onClick={() => {
                const nextIdx = (SPEED_OPTIONS.indexOf(playbackRate) + 1) % SPEED_OPTIONS.length;
                changePlaybackRate(SPEED_OPTIONS[nextIdx]);
              }}
              title="Change Playback Speed (< / >)"
            >
              <span>{playbackRate}x</span>
            </button>

            {/* Subtitles */}
            <button
              class={`vp-btn ${activeSubtitle !== 'off' ? 'active' : ''}`}
              onClick={toggleSubtitles}
              title="Toggle Subtitles (C)"
            >
              <SubtitlesIcon size={20} />
            </button>

            {/* PiP */}
            {isPiPSupported && (
              <button class="vp-btn" onClick={togglePiP} title="Picture-in-Picture (P)">
                <PipIcon size={20} />
              </button>
            )}

            {/* Settings */}
            <button
              class={`vp-btn ${isSettingsOpen ? 'active' : ''}`}
              onClick={() => {
                setIsSettingsOpen(!isSettingsOpen);
                setSettingsTab('main');
              }}
              title="Settings"
            >
              <SettingsIcon size={20} />
            </button>

            {/* Fullscreen */}
            <button class="vp-btn" onClick={toggleFullscreen} title="Fullscreen (F)">
              {isFullscreen ? <FullscreenExitIcon size={20} /> : <FullscreenEnterIcon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
