import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON middleware
app.use(express.json());

/**
 * 🩺 Health Check Endpoints
 * Used by Render Health Check, Cron-job.org, UptimeRobot, or curl to keep the web service awake 24/7.
 */
app.get(["/health", "/healthz", "/api/health"], (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  res.status(200).json({
    status: "healthy",
    message: "UED-ProjectHub Web Service is awake and running!",
    timestamp: new Date().toISOString(),
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    uptimeSeconds,
    service: "UED-ProjectHub",
    institution: "Khoa CNTT - Trường ĐH Sư phạm, ĐH Đà Nẵng",
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
  });
});

// Serve static assets from the Vite build directory
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// Single Page Application (SPA) fallback: serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Start listening on 0.0.0.0 (required by Render)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n======================================================`);
  console.log(`🚀 UED-ProjectHub Web Service is RUNNING on port ${PORT}`);
  console.log(`🩺 Health check URL: http://0.0.0.0:${PORT}/health`);
  console.log(`🌐 Application URL : http://0.0.0.0:${PORT}`);
  console.log(`======================================================\n`);
});
