import "dotenv/config";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const requiredEnvVars = [
  "DB_USER",
  "DB_PASS",
  "DB_NAME_AK",
  "DB_NAME_aBC",
  "DB_HOST",
  "DB_PORT",
  "PATH_FILES",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const config = {
  PORT: process.env.PORT || 5080,
  PATH_FILES: process.env.PATH_FILES,
};

export default config;
