import express from "express";
import api from "./api.js";

const { NODE_ENV, PORT = 3000 } = process.env;

async function main() {
  const app = express();
  app.use("/api/v1", api);

  if (NODE_ENV == "dev") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  console.log(`listening on port ${PORT}`);
  app.listen(PORT);
}

main();
