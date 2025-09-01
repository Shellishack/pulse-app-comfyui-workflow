/**
 *  This is a local dev server for "npm run dev" and "npm run preview".
 */

import express from "express";
import cors from "cors";
import pulseConfig from "./pulse.config";
import dotenv from "dotenv";
import livereload from "livereload";
import connectLivereload from "connect-livereload";
import { networkInterfaces } from "os";

dotenv.config({
  quiet: true,
});

const isPreview = process.env.PREVIEW;
const isDev = process.env.NODE_ENV;

if (isDev || isPreview) {
  const livereloadServer = livereload.createServer();
  livereloadServer.watch("dist");
  livereloadServer.server.once("connection", () => {
    console.log("✅ LiveReload connected");
  });
}

const app = express();
app.use(cors());
// Inject the client-side livereload script into HTML responses
app.use(connectLivereload());
app.use(express.json());

// Log each request to the console
app.use((req, res, next) => {
  console.log(`✅ [${req.method}] Received: ${req.url}`);
  return next();
});

if (isPreview) {
  /* Preview mode */
  app.use(express.static("dist/client"));
  app.use("/.server-function", express.static("dist/server"));
  app.all(/^\/server-function\/(.*)/, async (req, res) => {
    const func = req.params[0];

    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    // Convert Express req -> Fetch Request
    const request = new Request(url, {
      method: req.method,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      headers: req.headers as any,
      body: ["GET", "HEAD"].includes(req.method)
        ? null
        : JSON.stringify(req.body),
    });

    const { loadAndCall } = await import("./dist/preview/backend/index.cjs");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await loadAndCall(func, request);

    // If loadAndCall returns a Response (Fetch API Response)
    if (response instanceof Response) {
      res.status(response.status);
      response.headers.forEach((v, k) => res.setHeader(k, v));
      res.send(await response.text());
    } else {
      res.json(response);
    }
  });

  app.listen(3030);
} else if (isDev) {
  /* Dev mode  */
  app.use(`/${pulseConfig.id}/${pulseConfig.version}`, express.static("dist"));

  app.listen(3030);
} else {
  /* Production mode */
  app.use(`/${pulseConfig.id}/${pulseConfig.version}`, express.static("dist"));

  app.listen(3030, () => {
    console.log(`\
🎉 Your Pulse extension \x1b[1m${pulseConfig.displayName}\x1b[0m is LIVE! 

⚡️ Local: http://localhost:3030/${pulseConfig.id}/${pulseConfig.version}/
⚡️ Network: http://${getLocalNetworkIP()}:3030/${pulseConfig.id}/${
      pulseConfig.version
    }/

✨ Try it out in the Pulse Editor and let the magic happen! 🚀`);
  });
}

function getLocalNetworkIP() {
  const interfaces = networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address; // Returns the first non-internal IPv4 address
      }
    }
  }
  return "localhost"; // Fallback
}
