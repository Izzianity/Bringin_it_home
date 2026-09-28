import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  API_BASE_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().default("file:./dev.db"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  STORAGE_PATH: z.string().default("./uploads"),
  LISTEN_REWARD_AMOUNT: z.coerce.number().default(100),
  ARTIST_SHARE_PERCENT: z.coerce.number().min(0).max(100).default(30),
  POST_REWARD_AMOUNT: z.coerce.number().default(50),
  DAILY_POST_CAP: z.coerce.number().default(10),
  GLOBAL_DAILY_EARNING_CAP: z.coerce.number().default(1000),
  API_KEY_EXPIRY_DAYS: z.coerce.number().default(90),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
});

export type Config = z.infer<typeof envSchema>;

let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (cachedConfig) return cachedConfig;

  const config = envSchema.parse(process.env);
  cachedConfig = config;
  return config;
}

export const rewards = {
  listenAmount: () => getConfig().LISTEN_REWARD_AMOUNT,
  artistSharePercent: () => getConfig().ARTIST_SHARE_PERCENT,
  postAmount: () => getConfig().POST_REWARD_AMOUNT,
  dailyPostCap: () => getConfig().DAILY_POST_CAP,
  globalDailyEarningCap: () => getConfig().GLOBAL_DAILY_EARNING_CAP,
  apiKeyExpiryDays: () => getConfig().API_KEY_EXPIRY_DAYS,
};
