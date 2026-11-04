import "dotenv/config";
import { getConfig } from "./config/index.js";
import { getPrismaClient, disconnectPrisma } from "./db/client.js";
import { createApp } from "./app.js";

const config = getConfig();
const app = createApp({ prisma: getPrismaClient() });

const server = app.listen(config.PORT, () => {
  console.log(`✨ Bringin' It Home server running on port ${config.PORT}`);
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   API Base: ${config.API_BASE_URL}`);
});

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
