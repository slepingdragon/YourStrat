/** Dev-only: proxy /api/* → FastAPI on 127.0.0.1:8000 (same origin on web, no CORS). */
const http = require("http");
const connect = require("connect");

const API_HOST = "127.0.0.1";
const API_PORT = 8000;

function proxyApiRequest(req, res) {
  const upstreamPath = (req.url || "").replace(/^\/api/, "") || "/";
  const headers = { ...req.headers, host: `${API_HOST}:${API_PORT}` };
  delete headers.connection;

  const proxyReq = http.request(
    {
      hostname: API_HOST,
      port: API_PORT,
      path: upstreamPath,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "application/json" });
    }
    res.end(JSON.stringify({ detail: `API proxy error: ${err.message}` }));
  });

  if (req.method === "GET" || req.method === "HEAD") {
    proxyReq.end();
  } else {
    req.pipe(proxyReq);
  }
}

function apiProxyMiddleware(req, res, next) {
  const path = (req.url || "").split("?")[0];
  if (path === "/api" || path.startsWith("/api/")) {
    return proxyApiRequest(req, res);
  }
  next();
}

/**
 * Prepend /api proxy ahead of Metro middleware (or a Connect sub-app from NativeWind).
 * Must run after withNativeWind() in metro.config.js so it wraps the final stack.
 */
function enhanceWithApiProxy(middleware) {
  if (middleware && typeof middleware.handle === "function") {
    const server = connect();
    server.use(apiProxyMiddleware);
    server.use(middleware);
    return server;
  }

  return (req, res, next) => {
    const path = (req.url || "").split("?")[0];
    if (path === "/api" || path.startsWith("/api/")) {
      return proxyApiRequest(req, res);
    }
    return middleware(req, res, next);
  };
}

module.exports = { enhanceWithApiProxy, apiProxyMiddleware };
