import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Express } from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../server/routes';
import fs from 'fs';
import path from 'path';

let handler: ((req: VercelRequest, res: VercelResponse) => Promise<void>) | null = null;

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    // Initialize Express app and serverless handler on first request
    if (!handler) {
      const app: Express = express();

      // Middleware
      app.use(express.json({
        verify: (req: any, _res, buf) => {
          req.rawBody = buf;
        }
      }));
      app.use(express.urlencoded({ extended: false }));

      // Register API routes
      try {
        await registerRoutes(app);
      } catch (routeError) {
        console.error('Failed to register routes:', routeError);
        // Add a fallback route to show error for API routes
        app.use('/api/*', (req, res) => {
          res.status(503).json({
            message: 'Service temporarily unavailable. Check server logs.',
            error: process.env.NODE_ENV === 'development' ? String(routeError) : undefined
          });
        });
      }

      // Serve static files - only if they exist (for production)
      const distPath = path.resolve(import.meta.dirname, '..', 'dist', 'public');
      if (fs.existsSync(distPath)) {
        try {
          // Use dynamic import to avoid loading vite module
          const { serveStatic } = await import('../server/vite');
          serveStatic(app);
        } catch (staticError) {
          console.warn('Static file serving failed:', staticError);
          // Fallback: serve index.html for all non-API routes
          app.get('*', (req, res) => {
            if (!req.path.startsWith('/api')) {
              const indexPath = path.join(distPath, 'index.html');
              if (fs.existsSync(indexPath)) {
                res.sendFile(indexPath);
              } else {
                res.status(404).json({ message: 'Not found' });
              }
            } else {
              res.status(404).json({ message: 'API route not found' });
            }
          });
        }
      } else {
        console.warn('Build directory not found, static files will not be served');
        // Fallback for non-API routes
        app.get('*', (req, res) => {
          if (!req.path.startsWith('/api')) {
            res.status(503).json({
              message: 'Application is building. Please try again in a moment.',
              path: req.path
            });
          } else {
            res.status(404).json({ message: 'API route not found' });
          }
        });
      }

      // Error handler (must be last, after all routes)
      app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error('Express error:', err);
        const status = err.status || err.statusCode || 500;
        const message = err.message || 'Internal Server Error';
        res.status(status).json({ message });
      });

      // Wrap Express app with serverless-http
      const serverlessHandler = serverless(app, {
        binary: ['image/*', 'application/pdf'],
      });

      handler = async (req: VercelRequest, res: VercelResponse) => {
        try {
          await serverlessHandler(req as any, res as any);
        } catch (err) {
          console.error('Serverless handler error:', err);
          if (!res.writableEnded) {
            res.status(500).json({ message: 'Internal Server Error' });
          }
        }
      };
    }

    return handler(req, res);
  } catch (error) {
    console.error('Function initialization error:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
