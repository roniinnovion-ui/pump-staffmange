import dotenv from "dotenv";
import { onRequest } from "firebase-functions/v2/https";
import app from "./app.js";
import { connectDb } from "./config/db.js";

dotenv.config();

let dbReady;

const withDb = async (req, res) => {
  dbReady ||= connectDb();
  await dbReady;
  return app(req, res);
};

export const api = onRequest(
  {
    region: process.env.FIREBASE_REGION || "us-central1",
    memory: "512MiB",
    timeoutSeconds: 60
  },
  withDb
);

