import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { logger } from "./logger";
import { dbConnection } from "./db";
import UserServiceRoute from "./routes/user.service.ts";

config();

const app = express();
const PORT = 8000;

app.use(logger);
app.use(cors());
app.use(express.json());

app.use("/user", UserServiceRoute);

const run = async () => {
  await dbConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

void run();
