import { Router } from "express";
import type { Response, Request, NextFunction } from "express";

const UserServiceRoute = Router();

interface UserToCreate {
  email: string;
  organizationName: string;
  branches: number;
}

UserServiceRoute.post(
  "/createUsers",
  async (req: Request, res: Response, next: NextFunction) => {
    const requestBody: UserToCreate = req.body;



    return res.status(200).json({ message: "success" });
  }
);

export default UserServiceRoute;
