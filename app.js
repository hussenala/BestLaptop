const { requestHandler, start } = require("./server/server");

let express;
try {
  express = require("express");
} catch {
  express = null;
}

if (express) {
  const db = require("./server/db");
  const PORT = Number(process.env.PORT || 8765);
  const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
  const app = express();
  app.use((req, res) => requestHandler(req, res));
  app.listen(PORT, HOST, () => {
    const health = db.getHealth();
    console.log(`BEST LAPTOP server http://${HOST}:${PORT}/`);
    console.log(`Database ${health.db ? "connected" : "FAILED"} · users=${health.users}`);
  });
} else {
  start();
}
