import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import User from "../models/User.ts";
import { env } from "../dbConfig/dbConfig.ts";
import jwt from "jsonwebtoken";
import type { UserToCreate } from "../types";
import bcrypt from "bcrypt";
import Organization from "../models/Organization.ts";

const UserServiceRoute = Router();

type UserAuthorization = {
  email: string;
  password: string;
};

/**
 * @openapi
 * /user/getUserList:
 *   get:
 *     summary: Получить список пользователей организаций
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "user list"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 28
 *                       email:
 *                         type: string
 *                         example: "kulik6@gmail.com"
 *                       organizationName:
 *                         type: string
 *                         example: "kulikov6"
 *                       password:
 *                         type: string
 *                         example: "wBG%RZif"
 *                       role:
 *                         type: string
 *                         example: "owner"
 *                       branches:
 *                         type: integer
 *                         example: 5
 *                       token:
 *                         type: string
 *                         example: "09e4c83d0f046891b27e0c2ee6e76181be6b48a23e72ab99357ef6914fbcb8b9"
 *                       paidDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-17T15:45:00.000Z"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-26T08:03:07.767Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-26T08:03:07.767Z"
 *             example:
 *               message: "user list"
 *               data:
 *                 - id: 28
 *                   email: "kulik6@gmail.com"
 *                   organizationName: "kulikov6"
 *                   password: "wBG%RZif"
 *                   role: "owner"
 *                   branches: 5
 *                   token: "09e4c83d0f046891b27e0c2ee6e76181be6b48a23e72ab99357ef6914fbcb8b9"
 *                   paidDate: "2025-09-17T15:45:00.000Z"
 *                   isActive: true
 *                   createdAt: "2025-09-26T08:03:07.767Z"
 *                   updatedAt: "2025-09-26T08:03:07.767Z"
 */

UserServiceRoute.get(
  "/getUserList",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await User.findAll();

      return res.status(200).json({
        message: "user list",
        data: result,
      });
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @openapi
 * /user/auth:
 *   post:
 *     summary: Авторизация пользователя
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "kulik6@gmail.com"
 *               password:
 *                 type: string
 *                 example: "wBG%RZif"
 *           example:
 *             email: "kulik6@gmail.com"
 *             password: "wBG%RZif"
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 28
 *                     databaseName:
 *                       type: string
 *                       example: "kulikov6"
 *                     role:
 *                       type: string
 *                       example: "owner"
 *       401:
 *         description: Ошибка авторизации
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error"
 */

UserServiceRoute.post(
  "/auth",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password }: UserAuthorization = req.body;

      if (!email || !password) {
        return res.status(401).send({
          error: "email or password required",
        });
      }

      const user = await User.findOne({
        where: {
          email,
        },
        attributes: ["id", "email", "password", "role"],
      });

      if (!user) {
        return res.status(401).send({
          success: false,
          message: "Invalid credentials user",
        });
      }

      const organization = await Organization.findOne({
        where: { user_id: user.id },
      });

      if (!organization) {
        return res
          .status(401)
          .send({ message: "No organization found for this user" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          organizationName: organization.name,
        },
        env.JWT_SECRET!,
        { expiresIn: "24h" } // срок жизни токена
      );

      return res.status(200).json({
        success: true,
        message: "Success",
        token,
        user: {
          id: user.id,
        },
      });
    } catch (e) {
      console.error("Login error:", e);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

/**
 * @openapi
 * /user/changeUserData/{id}:
 *   put:
 *     summary: Обновить данные пользователя
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя для обновления
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationName
 *               - email
 *               - branches
 *             properties:
 *               organizationName:
 *                 type: string
 *                 example: "kulikov6"
 *               email:
 *                 type: string
 *                 example: "kulik6@gmail.com"
 *               branches:
 *                 type: integer
 *                 example: 5
 *               paidDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-09-17T15:45:00.000Z"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *           example:
 *             organizationName: "kulikov6"
 *             email: "kulik6@gmail.com"
 *             branches: 5
 *             paidDate: "2025-09-17T15:45:00.000Z"
 *             isActive: true
 *     responses:
 *       200:
 *         description: Данные пользователя успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 28
 *                     email:
 *                       type: string
 *                       example: "kulik6@gmail.com"
 *                     organizationName:
 *                       type: string
 *                       example: "kulikov6"
 *                     branches:
 *                       type: integer
 *                       example: 5
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     paidDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-17T15:45:00.000Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-26T08:03:07.767Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-26T09:15:11.120Z"
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found"
 *       422:
 *         description: Ошибка валидации или занятое имя организации
 *         content:
 *           application/json:
 *             examples:
 *               missingFields:
 *                 summary: Обязательные поля не указаны
 *                 value:
 *                   error: "Inputs required"
 *               duplicateOrgName:
 *                 summary: Имя организации занято другим пользователем
 *                 value:
 *                   error: "Organization name already taken"
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal server error"
 */

//можно менять пароль и убрать email isActive

interface UserToChange extends UserToCreate {
  password: string;
}

UserServiceRoute.put(
  "/changeUserData/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const userData: UserToChange = req.body;

      const { first_name, last_name, password, email } = userData;

      if (!first_name || !last_name) {
        return res.status(422).send({
          error: "Inputs required",
        });
      }

      // ищем пользователя
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).send({
          error: "User not found",
        });
      }

      // проверяем, что email не занят другим пользователем
      const existingEmail = await User.findOne({
        where: {
          email,
        },
      });

      if (existingEmail && existingEmail.id !== Number(userId)) {
        return res.status(422).send({
          error: "A user with this email address already exists.",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      // обновляем все поля
      if (last_name) user.last_name = last_name;
      if (first_name) user.first_name = first_name;
      user.password = hashedPassword;

      await user.save();

      return res.status(200).json({
        user,
      });
    } catch (error) {
      console.error("ERROR -------", error);
      next(error);
    }
  }
);

/**
 * @openapi
 * /user/deleteUserData/{id}:
 *   delete:
 *     summary: Удалить пользователя по ID
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя для удаления
 *     responses:
 *       200:
 *         description: Пользователь успешно удалён
 *         content:
 *           application/json:
 *             example:
 *               message: "User deleted successfully"
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal server error"
 */

UserServiceRoute.delete(
  "/deleteUserData/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      await user.destroy();

      return res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("ERROR -------", error);
      next(error);
    }
  }
);

export default UserServiceRoute;
