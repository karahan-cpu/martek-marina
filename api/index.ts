import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Express } from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../server/routes';
import fs from 'fs';
import path from 'path';

let handler: ((req: VercelRequest, res: VercelResponse) => Promise<void>) | null = null;

export default async function(req: VercelRequest, res: VercelResponse): Promise<void> {
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

      // Register API routes only (don't use the returned HTTP server in serverless)
      const _server = await registerRoutes(app);
      // Note: We ignore the server instance in serverless environment

      // Error handler
      app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error('Express error:', err);
        const status = err.status || err.statusCode || 500;
        const message = err.message || 'Internal Server Error';
        res.status(status).json({ message });
      });

      // Serve static files only if they exist (for SPA fallback)
      // Vercel handles static files, but we need this for SPA routing
      const distPath = path.resolve(process.cwd(), 'dist', 'public');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        // Fallback to index.html for SPA routing
        app.use('*', (_req, res) => {
          const indexPath = path.resolve(distPath, 'index.html');
          if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
          } else {
            res.status(404).json({ message: 'Not found' });
          }
        });
      } else {
        // If no static files, just return 404 for non-API routes
        app.use('*', (req, res) => {
          if (req.path.startsWith('/api')) {
            res.status(404).json({ message: 'API endpoint not found' });
          } else {
            res.status(404).json({ message: 'Not found' });
          }
        });
      }

      // Wrap Express app with serverless-http
      const serverlessHandler = serverless(app, {
        binary: ['image/*', 'application/pdf'],
      });
      
      handler = async (req: VercelRequest, res: VercelResponse) => {
        try {
          await serverlessHandler(req as any, res as any);
        } catch (error) {
          console.error('Serverless handler error:', error);
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
