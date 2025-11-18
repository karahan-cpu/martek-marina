import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Express } from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';

let handler: ((req: VercelRequest, res: VercelResponse) => Promise<void>) | null = null;

export default async function(req: VercelRequest, res: VercelResponse): Promise<void> {
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
    await registerRoutes(app);

    // Error handler
    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      res.status(status).json({ message });
    });

    // Serve static files - Express will handle SPA routing
    serveStatic(app);

    // Wrap Express app with serverless-http
    const serverlessHandler = serverless(app);
    handler = async (req: VercelRequest, res: VercelResponse) => {
      await serverlessHandler(req as any, res as any);
    };
  }

  return handler(req, res);
}
