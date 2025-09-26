import express from "express";
import Branch from "../models/Branch.ts";
import type { WhereOptions } from "sequelize";
import User from "../models/User.ts";

const BranchServiceRoute = express.Router();

BranchServiceRoute.get("/", async (req, res, next) => {
  try {
    const {owner} = req.query;
    const where: WhereOptions<Branch> = {};

    if (owner) {
      where.owner_id = Number(owner);
    }

    const listBranches = await Branch.findAll({ where });
    return res.send(listBranches);
  } catch (e) {
    next(e);
  }
});

BranchServiceRoute.get("/:id", async (req, res, next) => {
  try {
    const {id} = req.params;
    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).send({error: "Branch not found"})
    }

    return res.send(branch);
  } catch (e) {
    next(e);
  }
});

BranchServiceRoute.post("/", async (req, res, next) => {
  try {
    const {
      owner_id,
      name,
      phone,
      address,
    } = req.body;

    if (!owner_id || !name || !phone || !address) {
      return res.status(400).send({error: " owner_id, name, phone and address are required"})
    }

    const user = await User.findByPk(owner_id);

    if (!user) {
      return res.status(400).send({error: "User not found"})
    }
    if ((user.branches ?? 0) <= 0) {
      return res.status(400).send({ error: "User cannot have more branches" });
    }

    const currentBranches = await Branch.count({ where: { owner_id } });

    if (currentBranches >= user.branches) {
      return res.status(400).send({ error: `User can have only ${user.branches} branches` });
    }

    const newBranch = await Branch.create({owner_id, name, phone, address});
    return res.send({message: "Branch created successfully.", newBranch});
  } catch (e) {
    next(e);
  }
});

BranchServiceRoute.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, address } = req.body;

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).send({ error: "Branch not found" });
    }

    if (name !== undefined) branch.name = name;
    if (phone !== undefined) branch.phone = phone;
    if (address !== undefined) branch.address = address;

    await branch.save();

    return res.send({ message: "Branch updated successfully", branch });

  } catch (e) {
    next(e);
  }
});

export default BranchServiceRoute;