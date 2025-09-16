import { Router } from "express";
import type { Response, Request, NextFunction } from "express";

const UserServiceRoute = Router();

UserServiceRoute.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: "success" });
  }
);

export default UserServiceRoute;
