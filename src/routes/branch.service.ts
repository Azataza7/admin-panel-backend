import express from "express";
import Branch from "../models/Branch.ts";
import type { WhereOptions } from "sequelize";
import User from "../models/User.ts";

const BranchServiceRoute = express.Router();

/**
 * @openapi
 * /branches:
 *   get:
 *     summary: Получить список филиалов
 *     tags:
 *       - Branch
 *     parameters:
 *       - in: query
 *         name: owner
 *         schema:
 *           type: integer
 *         description: ID владельца для фильтрации
 *     responses:
 *       200:
 *         description: Список филиалов
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 owner_id: 2
 *                 name: "Main Office"
 *                 phone: "+123456789"
 *                 address: "ул. Ленина, 1"
 *               - id: 2
 *                 owner_id: 2
 *                 name: "Branch 2"
 *                 phone: "+987654321"
 *                 address: "ул. Советская, 5"
 */

/**
 * @openapi
 * /branches/{id}:
 *   get:
 *     summary: Получить филиал по ID
 *     tags:
 *       - Branch
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID филиала
 *     responses:
 *       200:
 *         description: Филиал найден
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               owner_id: 2
 *               name: "Main Office"
 *               phone: "+123456789"
 *               address: "ул. Ленина, 1"
 *       404:
 *         description: Branch not found
 */

/**
 * @openapi
 * /branches:
 *   post:
 *     summary: Создать филиал
 *     tags:
 *       - Branch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             owner_id: 2
 *             name: "New Branch"
 *             phone: "+777777777"
 *             address: "ул. Победы, 10"
 *     responses:
 *       200:
 *         description: Branch created
 *         content:
 *           application/json:
 *             example:
 *               message: "Branch created successfully."
 *               newBranch:
 *                 id: 3
 *                 owner_id: 2
 *                 name: "New Branch"
 *                 phone: "+777777777"
 *                 address: "ул. Победы, 10"
 *       400:
 *         description: Ошибка валидации
 */

/**
 * @openapi
 * /branches/{id}:
 *   patch:
 *     summary: Обновить филиал
 *     tags:
 *       - Branch
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID филиала
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Updated Branch"
 *             phone: "+111111111"
 *             address: "ул. Гагарина, 25"
 *     responses:
 *       200:
 *         description: Branch updated
 *         content:
 *           application/json:
 *             example:
 *               message: "Branch updated successfully"
 *               branch:
 *                 id: 1
 *                 owner_id: 2
 *                 name: "Updated Branch"
 *                 phone: "+111111111"
 *                 address: "ул. Гагарина, 25"
 *       404:
 *         description: Branch not found
 */

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

BranchServiceRoute.patch("/:id/deactivate", async (req, res, next) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).send({ error: "Branch not found" });
    }

    if (!branch.status) {
      return res.status(401).send({message: "Permission denied"})
    }

    branch.status = false;
    await branch.save();
    return res.send({ message: `You have deactivated the branch: ${branch.name}` });

  } catch (e) {
    next(e);
  }
});

export default BranchServiceRoute;