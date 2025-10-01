import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { logger } from "./logger";
import { dbConnection } from "./db";
import UserServiceRoute from "./routes/user.service.ts";
import AdminServiceRoute from "./routes/admin.service.ts";
import authorizationService from "./routes/authorization.service.ts";
import BranchServiceRoute from "./routes/branch.service.ts";
import { setupSwagger } from "../swagger.ts";
import ClientServiceRouter from "./routes/client.service.ts";
import OrganizationServiceRoute from "./routes/organization.service.ts";

config();

const app = express();
const PORT = 8000;

app.use(logger);
// app.use(cors());
app.use(
  cors({
    origin: "https://instant-arlena-promconsulting-cb589535.koyeb.app", // только для фронта на 3000 порту
    methods: ["GET", "POST", "PUT", "DELETE"], // какие методы разрешены
    credentials: true, // если надо передавать куки или токены
  })
);
app.use(express.json());
app.use("/user", UserServiceRoute);
app.use("/branches", BranchServiceRoute);
app.use("/clients", ClientServiceRouter);
app.use("/organization", OrganizationServiceRoute);

//superadmin routes
app.use("/admin", AdminServiceRoute);
app.use("/admin", authorizationService);

setupSwagger(app);

const run = async () => {
  await dbConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

void run();
