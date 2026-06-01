import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import initSockets from "./sockets/index.js";

const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initSockets(server);

app.set("io", io);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
