import "dotenv/config";
import express from "express";
import cors from "cors";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

const app = express();

// Use CORS so the frontend from a different URL can access the backend
app.use(
    cors({
        origin: process.env.FRONTEND_URL || true, // Change "true" to your specific frontend URL in production
        credentials: true,
    })
);

app.use(
    express.json({
        verify: (req, _res, buf) => {
            (req as any).rawBody = buf;
        },
    })
);

app.use(express.urlencoded({ extended: false }));

const httpServer = createServer(app);

// Initialize routes synchronously inside the file
// Vercel serverless executes the exported app as a request handler
registerRoutes(httpServer, app).catch(console.error);

export default app;
