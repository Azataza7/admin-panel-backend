import express from "express";
import ClientActivity from "../models/ClientActivity.ts";
import { nanoid } from "nanoid";
import Branch from "../models/Branch.ts";
import Client from "../models/Client.ts";
import Organization from "../models/Organization.ts";
import type { Request, Response, NextFunction } from "express";

const ClientServiceRouter = express.Router();

//фильтрация по источнику
ClientServiceRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clients = await Client.findAll();
      const clientsActivity = await ClientActivity.findAll();
      return res.send({
        clients,
        clientsActivity,
      });
    } catch (e) {
      next(e);
    }
  }
);

// API для добавления клиента + создание активности клиента
ClientServiceRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        first_name,
        last_name,
        phone_number,
        branch_id,
        source,
        organizationId,
      } = req.body;

      if (!first_name || !phone_number || !branch_id) {
        return res.status(400).json({ message: "Required fields are missing" });
      }

      const existingClient = await Client.findOne({
        where: { phone_number },
      });

      const existingBranch = await Branch.findByPk(branch_id);
      const existingOrg = await Organization.findByPk(organizationId);
      console.log(existingOrg);

      if (existingClient) {
        return res.status(400).json({ message: "Client already exists" });
      }

      if (!existingBranch) {
        return res.status(400).json({ message: "Branch  not found" });
      }

      if (!existingOrg) {
        return res.status(400).json({ message: "Organization not found" });
      }

      const source_id = `${source}_${Date.now()}_${nanoid(6)}`;

      const client = await Client.create({
        first_name,
        last_name: last_name || null,
        phone_number: phone_number.trim(),
        source_id,
        is_active: true,
        organization_id: organizationId,
      });

      const clientActivity = await ClientActivity.create({
        client_id: client.id,
        branch_id,
        service_id: 1,
      });

      console.log(clientActivity);

      return res.send({
        message: "Client added successfully",
        client,
      });
    } catch (e) {
      next(e);
    }
  }
);

ClientServiceRouter.get(
  "/getClientBySource",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clients = await Client.findAll({
        where: { source_id: req.headers.source_id },
      });

      return res.send({ message: "Success", data: clients });
    } catch (e) {
      console.error("Error:" + e);

      next(e);
    }
  }
);

// API для активации/диактивации клиента
ClientServiceRouter.patch(
  "/:id/activate",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      let { is_active } = req.body;

      if (typeof is_active === "string") {
        is_active = is_active.toLowerCase() === "true";
      }

      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      if (is_active === client.is_active) {
        return res.status(400).json({
          message: `Client is already ${is_active ? "active" : "inactive"}`,
        });
      }

      client.is_active = is_active;
      await client.save();

      return res.json({
        message: `Client ${client.first_name} ${client.last_name ?? ""} ${is_active ? "activated" : "deactivated"}`,
      });
    } catch (e) {
      next(e);
    }
  }
);

//API для обновления/создания активности клиента
ClientServiceRouter.patch(
  "/:id/last-activity",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = Number(req.params.id);
      const { branch_id, service_id } = req.body;

      if (!branch_id || !service_id) {
        return res
          .status(400)
          .send({ message: "branch_id and service_name are required" });
      }

      const existingBranch = await Branch.findByPk(branch_id);
      if (!existingBranch) {
        return res.status(404).send({ error: "Branch not found" });
      }

      const lastActivity = await ClientActivity.findOne({
        where: { client_id: clientId, branch_id },
        order: [["last_active_at", "DESC"]],
      });

      if (lastActivity) {
        lastActivity.service_id = service_id;
        await lastActivity.save();
      } else {
        await ClientActivity.create({
          client_id: clientId,
          branch_id,
          service_id,
        });
      }

      return res.send({ message: "Client activity updated successfully" });
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
);

ClientServiceRouter.patch(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, custom_name } = req.body;

      const client = await Client.findByPk(id);

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // обновляем только те поля, которые пришли
      if (first_name !== undefined) client.first_name = first_name;
      if (last_name !== undefined) client.last_name = last_name;
      if (custom_name !== undefined) client.custom_name = custom_name;

      await client.save();

      return res.json({
        message: "Client updated successfully",
        client,
      });
    } catch (e) {
      next(e);
    }
  }
);

export default ClientServiceRouter;
