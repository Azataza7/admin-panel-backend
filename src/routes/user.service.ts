import { Router } from "express";
import type { Response, Request, NextFunction } from "express";
import User from "../models/User.ts";
import { generatePassword } from "../methods/methods.ts";

const UserServiceRoute = Router();

interface UserToCreate {
  email: string;
  role: string;
  organizationName: string;
  branches: number;
}

UserServiceRoute.get(
  "/getUserList",
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await User.findAll();

    return res.status(200).json({ message: "user list", data: result });
  }
);

UserServiceRoute.post(
  "/createUsers",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: UserToCreate = req.body;

      const { organizationName, branches, email } = userData;

      if (!organizationName || !email || !branches) {
        return res.status(422).send({ error: "Inputs required" });
      }

      const existedOrganizationName = await User.findOne({
        where: { organizationName },
      });

      if (existedOrganizationName) {
        return res.status(422).send({ error: "User already exists" });
      }

      const hashedPassword = await generatePassword();

      const user = {
        email: email,
        organizationName: organizationName,
        password: hashedPassword,
        branches: branches,
        role: "user" as const,
      };

      const newUser = await User.create(user);

      return res.status(201).json({
        id: newUser.id,
        organizationName: newUser.organizationName,
        password: newUser.password,
        role: newUser.role,
        token: newUser.token,
        createdAt: newUser.createdAt,
      });
    } catch (error) {
      console.log("ERROR -------" + error);
      next(error);
    }
  }
);

export default UserServiceRoute;
