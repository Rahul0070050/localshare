import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { FileItem } from '../types';
import { CloseIcon, DownloadIcon } from './Icons';
import { VideoPlayer } from './VideoPlayer';
import { getPreviewUrl, getDownloadUrl } from '../utils/formatters';

interface PreviewModalProps {
  item: FileItem | null;
  onClose: () => void;
}

export function PreviewModal({ item, onClose }: PreviewModalProps) {
  const [textContent, setTextContent] = useState<string>('');
  const [textLoading, setTextLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!item) {
      setTextContent('');
      return;
    }

    // Keyboard listener for Escape
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);

    // If code or document text, fetch text preview
    if (item.category === 'code' || (item.category === 'document' && item.name.endsWith('.txt'))) {
      setTextLoading(true);
      fetch(getPreviewUrl(item))
        .then((res) => res.text())
        .then((txt) => {
          setTextContent(txt);
          setTextLoading(false);
        })
        .catch(() => {
          setTextContent('Failed to load text content preview.');
          setTextLoading(false);
        });
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const previewUrl = getPreviewUrl(item);
  const downloadUrl = getDownloadUrl(item);

  const handleCopy = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div
      class="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div class={`modal-dialog ${item.category === 'video' ? 'modal-dialog-video' : ''}`}>
        {/* Modal Header */}
        <div class="modal-head">
          <div class="modal-headline" title={item.name}>
            <span>{item.name}</span>
            <span class="badge-category" style={{ fontSize: '0.72rem' }}>
              {item.category}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {item.category === 'code' && (
              <button class="action-btn" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            )}

            <a href={downloadUrl} class="action-btn primary" download={item.name}>
              <DownloadIcon size={14} />
              Download
            </a>

            <button class="btn-toggle" title="Close Preview (Esc)" onClick={onClose}>
              <CloseIcon size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div class={`modal-content-area ${item.category === 'video' ? 'video-stage-mode' : ''}`}>
          {item.category === 'image' && (
            <img class="preview-img-full" src={previewUrl} alt={item.name} />
          )}

          {item.category === 'video' && (
            <VideoPlayer src={previewUrl} title={item.name} onClose={onClose} />
          )}

          {item.category === 'audio' && (
            <div class="preview-audio-container">
              <audio controls autoPlay style={{ width: '100%', maxWidth: '480px' }}>
                <source src={previewUrl} />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {item.category === 'document' && !item.name.endsWith('.txt') && (
            <iframe
              class="preview-pdf-frame"
              src={previewUrl}
              title={item.name}
            />
          )}

          {(item.category === 'code' || (item.category === 'document' && item.name.endsWith('.txt'))) && (
            <div class="code-preview-wrapper">
              {textLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading text content...
                </div>
              ) : (
                <pre class="code-box">
                  <code>
                    {textContent.split('\n').map((line, i) => (
                      <div key={i} class="code-line">
                        <span class="line-num">{i + 1}</span>
                        <span class="line-text">{line || ' '}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
