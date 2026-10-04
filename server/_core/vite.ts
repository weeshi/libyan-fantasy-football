import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  // Manus Preview runs the app through the development middleware, but its
  // public proxy does not expose the Vite HMR WebSocket endpoint. Keep HMR
  // opt-in so the preview never injects a client that can only reach localhost.
  const enableHmr = process.env.ENABLE_VITE_HMR === "true";
  const serverOptions = {
    middlewareMode: true,
    hmr: enableHmr ? { server } : false,
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // SPA fallback: serve index.html for all non-API routes
  app.use("*", async (req, res, next) => {
    // Skip API routes - let them fall through to error handler
    if (req.path.startsWith("/api")) {
      return next();
    }

    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      
      // Keep the generated HTML consistent with the HMR setting. Vite may
      // inject its client while transforming the template in middleware mode.
      let finalPage = page;
      if (!enableHmr) {
        finalPage = page.replace(/<script[^>]*src="\/\@vite\/client"[^>]*><\/script>/g, '');
      }
      
      res.status(200).set({ "Content-Type": "text/html" }).end(finalPage);
    } catch (e) {
      console.error(`[Vite] Error serving SPA for ${url}:`, e);
      vite.ssrFixStacktrace(e as Error);
      res.status(500).send("Internal Server Error");
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // SPA fallback: serve index.html for all non-API routes
  app.use("*", (req, res) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Not found" });
    }
    
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      return res.status(500).send("index.html not found");
    }
    
    res.sendFile(indexPath);
  });
}
