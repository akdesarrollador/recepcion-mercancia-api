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
  "JWT_SECRET",
  "FTP_SERVER",
  "FTP_USER",
  "FTP_PASS",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const config = {
  PORT: process.env.PORT || 5080,
  FTP_CONFIG: {
    host: process.env.FTP_SERVER,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS,
    secure: false, //
  },
};

export default config;
