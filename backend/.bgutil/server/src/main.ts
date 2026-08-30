import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
const VERSION = packageJson.version || "unknown";

const args = process.argv.slice(2);
let PORT_NUMBER = 4416;
for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--port" || args[i] === "-p") && args[i + 1]) {
    PORT_NUMBER = Number(args[i + 1]);
    break;
  }
}

if (!Number.isInteger(PORT_NUMBER) || PORT_NUMBER < 1 || PORT_NUMBER > 65535) {
  console.error(`Invalid port: ${PORT_NUMBER}`);
  process.exit(2);
}

const HOST = "127.0.0.1";
let sessionManagerPromise: Promise<any> | undefined;

async function getSessionManager() {
  if (!sessionManagerPromise) {
    sessionManagerPromise = import("./session_manager.js").then(({ SessionManager }) => new SessionManager());
  }
  return sessionManagerPromise;
}

function sendJson(response: http.ServerResponse, status: number, value: unknown) {
  const body = JSON.stringify(value);
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Content-Length", Buffer.byteLength(body));
  response.end(body);
}

async function readJson(request: http.IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return {}; }
}

async function handle(request: http.IncomingMessage, response: http.ServerResponse) {
  const url = new URL(request.url || "/", `http://${HOST}:${PORT_NUMBER}`);

  if (request.method === "GET" && url.pathname === "/ping") {
    return sendJson(response, 200, { server_uptime: process.uptime(), version: VERSION });
  }

  if (request.method === "GET" && url.pathname === "/minter_cache") {
    const manager = await getSessionManager();
    console.debug(manager.minterCache);
    return sendJson(response, 200, Array.from(manager.minterCache.keys()));
  }

  if (request.method === "POST" && url.pathname === "/get_pot") {
    const body: any = await readJson(request);
    if (body.data_sync_id) return sendJson(response, 400, { error: "data_sync_id is deprecated, use content_binding instead" });
    if (body.visitor_data) return sendJson(response, 400, { error: "visitor_data is deprecated, use content_binding instead" });
    if (body.disable_innertube) return sendJson(response, 400, { error: "disable_innertube is deprecated because the /Create endpoint doesn't work anymore" });

    try {
      const manager = await getSessionManager();
      return sendJson(response, 200, await manager.generatePoToken(
        body.content_binding,
        body.proxy,
        body.bypass_cache || false,
        body.source_address,
        body.disable_tls_verification || false,
        body.challenge,
        body.innertube_context,
      ));
    } catch (e) {
      const { strerror } = await import("./utils.js");
      console.error((e as any)?.stack || e);
      return sendJson(response, 500, { error: strerror(e, true) });
    }
  }

  if (request.method === "POST" && url.pathname === "/invalidate_caches") {
    const manager = await getSessionManager();
    manager.invalidateCaches();
    response.statusCode = 204;
    return response.end();
  }

  if (request.method === "POST" && url.pathname === "/invalidate_it") {
    const manager = await getSessionManager();
    manager.invalidateIT();
    response.statusCode = 204;
    return response.end();
  }

  return sendJson(response, 404, { error: "Not found" });
}

const server = http.createServer((request, response) => {
  handle(request, response).catch(async (error) => {
    console.error("bgutil request error:", error?.stack || error);
    if (!response.headersSent) sendJson(response, 500, { error: String(error?.message || error) });
    else response.end();
  });
});

server.once("error", (error) => {
  console.error(`Could not listen on ${HOST}:${PORT_NUMBER}: ${(error as any)?.code || "unknown"}`);
  console.error((error as any)?.stack || error);
  process.exit(1);
});

server.listen(PORT_NUMBER, HOST, () => {
  console.log(`Started POT server (v${VERSION}) on address ${HOST}:${PORT_NUMBER}`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
