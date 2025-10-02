import express from "express";
import Organization from "../models/Organization.ts";
import { createClientDatabase } from "../methods/octo_database.ts";
import User from "../models/User.ts";
import type { WhereOptions } from "sequelize";

interface OrganizationCreate {
  name: string;
  user_id: number;
  branches: number;
  paidDate: Date;
  isActive: boolean;
}

const OrganizationServiceRoute = express.Router();

OrganizationServiceRoute.get("/", async (req, res, next) => {
  try  {
    const { ownerId } = req.query;
    const where: WhereOptions<Organization> = {};

    if (ownerId) where.user_id = Number(ownerId);

    const organizationList = await Organization.findAll({ where });
    res.send(organizationList);
  } catch (e) {
    next(e);
  }
});

OrganizationServiceRoute.get("/:id", async (req, res, next) => {
  try {
    const {id} = req.params;
    const organization = await Organization.findByPk(id);
    res.send(organization);
  } catch (e) {
    next(e);
  }
});

OrganizationServiceRoute.post("/", async (req, res, next) => {
  try {
    const {
      name,
      branches,
      paidDate,
      userId
    } = req.body ;


    if (!paidDate || !name || !branches || !userId) {
      return res.status(400).send({error: "Inputs required"});
    }

    const existingOrganization = await Organization.findOne({
      where: { name },
    });

    const existingUser = await User.findByPk(userId);

    if (existingOrganization) {
      return res.status(400).send({error: "Organization already exists"});
    }

    if (!existingUser) {
      return res.status(400).send({error: "The user does not exist"});
    }

    const organization: OrganizationCreate = {
      name: name,
      user_id: Number(userId),
      branches,
      paidDate: paidDate,
      isActive: true
    };

    const result = await createClientDatabase(organization);

    if (result === 0) {
      const newOrganization = await Organization.create(organization);

      return res.status(201).json({
        newOrganization,
      });
    } else {
      return res.status(500).send({
        error: "Database issue",
      });
    }
  } catch (e) {
    console.log(e);
    next(e);
  }
});

OrganizationServiceRoute.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, branches, paidDate, isActive } = req.body;

    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (name !== undefined) organization.name = name;
    if (branches !== undefined) organization.branches = branches;
    if (paidDate !== undefined) organization.paidDate = new Date(paidDate);
    if (isActive !== undefined) organization.isActive = isActive;

    await organization.save();

    res.send(organization);

  } catch (e) {
    next(e);
  }
});

export default OrganizationServiceRoute;