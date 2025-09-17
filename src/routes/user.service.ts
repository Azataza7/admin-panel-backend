import { Router } from "express";
import type { Response, Request, NextFunction } from "express";
import User from "../models/User.ts";
import { generatePassword } from "../methods/methods.ts";

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
        role: "user" as const,
      };

      const newUser = await User.create(user);

      return res.status(201).json({ newUser });
    } catch (error) {
      console.log("ERROR -------" + error);
      next(error);
    }
  }
);

UserServiceRoute.put(
  "/changeUserData",
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
      user.role = "user";

      await user.save();

      return res.status(200).json({ user });
    } catch (error) {
      console.error("ERROR -------", error);
      next(error);
    }
  }
);

export default UserServiceRoute;
