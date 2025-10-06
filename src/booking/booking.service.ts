import { Router } from "express";
import type { NextFunction, Response, Request } from "express";
import Organization from "../models/Organization.ts";
import { authMiddleware } from "../middleware/auth.ts";
import Branch from "../models/Branch.ts";
import jwt from "jsonwebtoken";
import { env } from "../dbConfig/dbConfig.ts";
import axios from "axios";
import { Model } from "sequelize";

const BookingRoute = Router();

interface OrganizationWithBranches extends Model {
  id: number;
  user_id: number;
  name: string;
  branches: number;
  paidDate: Date;
  isActive: boolean;
  organizationBranches: Branch[];
}

BookingRoute.get(
  "/getOrganizations",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationList = await Organization.findAll({
        include: [
          {
            model: Branch,
            as: "organizationBranches",
            attributes: ["id", "name", "phone", "address", "isActive"], // какие поля нужны
          },
        ],
      });

      res.send({ message: "success", data: organizationList });
    } catch (e) {
      console.error("Error: " + e);

      next(e);
    }
  }
);

BookingRoute.get(
  "/getOrganizations/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organization = await Organization.findByPk(req.params.id, {
        include: [
          {
            model: Branch,
            as: "organizationBranches",
            attributes: ["id", "name", "phone", "address", "isActive"], // какие поля нужны
          },
        ],
      }) as unknown as OrganizationWithBranches | null;

      if (!organization) {
        return res.status(404).send({ message: "No organization with this id" });
      }

      const token = jwt.sign(
        { organizationName: organization.name },
        env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const servicesResponse = await axios.get(
        "https://lesser-felicdad-promconsulting-79f07228.koyeb.app/services",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const services = servicesResponse.data;

      // Привязываем сервисы к филиалам
      const branchesWithServices = organization.organizationBranches.map(
        (branch) => ({
          ...branch.toJSON(), // если это Sequelize объект
          services: services.filter((s: any) => s.branch_id === branch.id),
        })
      );

      // Отправляем уже с сервисами
      return res.status(200).send({
        organization: {
          ...organization.toJSON(),
          organizationBranches: branchesWithServices,
        },
      });
    } catch (e) {
      console.error("Error: " + e);

      next(e);
    }
  }
);

export default BookingRoute;

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Работа с организациями и их филиалами
 */

/**
 * @swagger
 * /booking/getOrganizations:
 *   get:
 *     summary: Получить список всех организаций с филиалами
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список организаций с их филиалами
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrganizationWithBranches'
 *       401:
 *         description: Неавторизованный доступ
 *       500:
 *         description: Внутренняя ошибка сервера
 *
 * /booking/getOrganizations/{id}:
 *   get:
 *     summary: Получить организацию по ID с филиалами и сервисами
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID организации
 *     responses:
 *       200:
 *         description: Организация с филиалами и привязанными сервисами
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organization:
 *                   $ref: '#/components/schemas/OrganizationWithBranches'
 *       401:
 *         description: Неавторизованный доступ
 *       404:
 *         description: Организация с указанным ID не найдена
 *       500:
 *         description: Внутренняя ошибка сервера
 *
 * components:
 *   schemas:
 *     BranchWithServices:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         isActive:
 *           type: boolean
 *         services:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               branch_id:
 *                 type: integer
 *
 *     OrganizationWithBranches:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         name:
 *           type: string
 *         branches:
 *           type: integer
 *         paidDate:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *         organizationBranches:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BranchWithServices'
 *
 * securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 */

