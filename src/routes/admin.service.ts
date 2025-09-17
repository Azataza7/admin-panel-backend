import { type NextFunction, type Request, type Response, Router } from "express";
import bcrypt from "bcrypt";
import AdminModel from "../models/AdminModel.ts";

const AdminServiceRoute = Router();

interface adminType {
  username: string;
  password: string;
  role: "admin";
}

const AUTH_TOKEN = process.env.AUTHORIZATION_TOKEN;

AdminServiceRoute.post("/signUp", async (req: Request, res: Response, next: NextFunction) => {
  const { username, password }: adminType = req.body;
  const authorizationToken = req.get("Auth-token");

  if (!authorizationToken) {
    return res.status(401).send({ message: "No token provided" });
  }

  if (authorizationToken !== AUTH_TOKEN) {
    return res.status(401).send({ message: "No token provided" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = {
    username: username,
    role: "admin" as const,
    password: hashedPassword,
  };

  const newAdmin = await AdminModel.create(admin);

  return res.status(201).json({
    username: newAdmin.username,
    role: newAdmin.role,
    createdAt: newAdmin.createdAt,
  });
});

export default AdminServiceRoute;
