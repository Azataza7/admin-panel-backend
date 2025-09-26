import { Router } from "express";
import type { Response, Request, NextFunction } from "express";
import User from "../models/User.ts";
import { generatePassword } from "../methods/methods.ts";
import { createClientDatabase } from "../methods/octo_database.ts";

const UserServiceRoute = Router();

interface UserToCreate {
  email: string;
  role: string;
  paidDate: Date;
  isActive: boolean;
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

      const { organizationName, branches, email, paidDate, isActive } = userData;

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
        paidDate: paidDate,
        password: hashedPassword,
        branches: branches,
        isActive: isActive,
        role: "owner" as const,
      };

      const result = await createClientDatabase(user);

      if (result === 0) {
        const newUser = await User.create(user);

        return res.status(201).json({ newUser });
      } else {
        return res.status(500).send({ error: "Database issue" });
      }
    } catch (error) {
      console.log("ERROR -------" + error);
      next(error);
    }
  }
);

UserServiceRoute.put(
  "/changeUserData/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const userData: UserToCreate = req.body;

      const { organizationName, branches, email, paidDate, isActive } = userData;

      if (!organizationName || !email || !branches) {
        return res.status(422).send({ error: "Inputs required" });
      }

      // ищем пользователя
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      // проверяем, что organizationName не занят другим пользователем
      const existedOrganizationName = await User.findOne({
        where: { organizationName },
      });

      if (existedOrganizationName && existedOrganizationName.id !== Number(userId)) {
        return res.status(422).send({ error: "Organization name already taken" });
      }

      const hashedPassword = await generatePassword();

      // обновляем все поля
      user.email = email;
      user.organizationName = organizationName;
      user.paidDate = paidDate;
      user.password = hashedPassword;
      user.branches = branches;
      user.isActive = isActive;
      user.role = "owner";

      await user.save();

      return res.status(200).json({ user });
    } catch (error) {
      console.error("ERROR -------", error);
      next(error);
    }
  }
);

UserServiceRoute.delete(
  "/deleteUserData/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await user.destroy();

      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("ERROR -------", error);
      next(error);
    }
  }
);

export default UserServiceRoute;
