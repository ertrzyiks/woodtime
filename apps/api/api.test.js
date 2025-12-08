import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

describe('API E2E Tests', () => {
  let server;
  let apolloServer;
  let port;

  beforeAll(async () => {
    // Import the app and server
    const { app, server: appServer } = require('./src/app');
    apolloServer = appServer;

    // Start the Apollo server
    await apolloServer.start();
    
    // Apply middleware
    apolloServer.applyMiddleware({
      app,
      path: '/woodtime',
      cors: {
        origin: true,
        credentials: true
      }
    });

    // Start the HTTP server
    port = 0; // Use random available port
    await new Promise((resolve) => {
      server = app.listen(port, () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Stop the server
    await apolloServer.stop();
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
  });

  it('should return 200 for GraphQL endpoint', async () => {
    const response = await fetch(`http://localhost:${port}/woodtime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ __typename }',
      }),
    });

    expect(response.status).toBe(200);
  });

  it('should respond to introspection query', async () => {
    const response = await fetch(`http://localhost:${port}/woodtime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ __schema { types { name } } }',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(data.data.__schema).toBeDefined();
  });

  it('should return 200 for me query (unauthenticated)', async () => {
    const response = await fetch(`http://localhost:${port}/woodtime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ me { id name } }',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(data.data.me).toBeNull();
  });
});
