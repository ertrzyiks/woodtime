// public/apiMockServiceWorker.js
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (!url.pathname.startsWith('/woodtime')) {
    // Do not propagate this event to other listeners (from MSW)
    event.stopImmediatePropagation();
  }
});

importScripts('./mockServiceWorker.js');
