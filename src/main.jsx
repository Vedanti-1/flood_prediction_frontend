import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

const originalFetch = window.fetch.bind(window);

window.fetch = (input, init = {}) => {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof Request
        ? input.url
        : '';

  const auth = sessionStorage.getItem('adminAuth');

  if (
    auth &&
    url.includes('/api/')
  ) {
    const headers = new Headers(
      init.headers ||
        (input instanceof Request ? input.headers : undefined)
    );

    if (!headers.has('Authorization')) {
      headers.set('Authorization', auth);
    }

    init = {
      ...init,
      headers,
    };
  }

  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);