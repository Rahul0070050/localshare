import { h, Fragment, render } from 'preact';
import { App } from './App';

// Expose Preact globals as failsafe for JSX evaluation
if (typeof window !== 'undefined') {
  (window as any).h = h;
  (window as any).Fragment = Fragment;
}

const container = document.getElementById('root');
if (container) {
  render(<App />, container);
}
