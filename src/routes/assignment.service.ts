import express from "express";
import Assignment from "../models/Assignment.ts";

const AssignmentsServiceRoute = express.Router();

AssignmentsServiceRoute.get("/", (req, res, next) => {
  try {
    const assignment = Assignment.findAll();
    res.send(assignment);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

AssignmentsServiceRoute.get("/:id", (req, res, next) => {
  try {
    const { id } = req.params;
    const assignment = Assignment.findByPk(id);

    if (!assignment) {
      return res.status(404).send({error: "No Assignment found with this id"});
    }

    res.send(assignment);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

AssignmentsServiceRoute.post("/calendar", async (req, res, next) => {
  try {
    const {
      clientAssignment
    } = req.body;

    if (!clientAssignment) {
      res.status(404).send({ error: "No data available to create assignment" });
    }

    const assignment = await Assignment.create({
      id: clientAssignment.id,
      chat_id: clientAssignment.chat_id || null,
      branch_id: clientAssignment.branch_id,
      organization_id: clientAssignment.organization_id,
      client_id: clientAssignment.client_id,
      client_snapshot: clientAssignment.client_snapshot,
      service_id: clientAssignment.service_id,
      service_snapshot: clientAssignment.service_snapshot,
      assignment_date: clientAssignment.assignment_date,
      start_time: clientAssignment.start_time,
      end_time: clientAssignment.end_time,

      manager_id: clientAssignment.manager_id || null,
      manager_snapshot: clientAssignment.manager_snapshot || null,
      employee_id: clientAssignment.employee_id,
      employee_snapshot: clientAssignment.employee_snapshot,

      timezone: clientAssignment.timezone || "UTC",
      status: clientAssignment.status || "new",

      additional_services: clientAssignment.additional_services || [],
      notes: clientAssignment.notes || null,
      source: clientAssignment.source,

      discount: clientAssignment.discount || 0,
      final_price: clientAssignment.final_price,
      total_duration: clientAssignment.total_duration,
      payment_method: clientAssignment.payment_method || null,
      paid: clientAssignment.paid || "unpaid",
    });
    res.send(assignment);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

AssignmentsServiceRoute.put("/calendar/:id", async (req, res, next) => {
  try {
    const {
      clientAssignment
    } = req.body;

    const { id } = req.params;
    const assignment = await Assignment.findByPk(id);
    if ( !assignment ) {
      return res.status(404).send({error: "No Assignment found with this id"});
    }

    if (!clientAssignment) {
      res.status(404).send({error: "No data available to create assignment"});
    }

    await assignment.update(clientAssignment);

    res.send(assignment);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

/**
 * @openapi
 * components:
 *   schemas:
 *     UserInfo:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           example: "Jane"
 *         last_name:
 *           type: string
 *           example: "Doe"
 *           nullable: true
 *         role:
 *           type: string
 *           example: "employee"
 *
 *     ClientInfo:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           example: "John"
 *         last_name:
 *           type: string
 *           example: "Smith"
 *           nullable: true
 *         phone:
 *           type: string
 *           example: "+123456789"
 *
 *     ServiceInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Haircut"
 *         price:
 *           type: number
 *           example: 50
 *         duration:
 *           type: number
 *           example: 60
 *
 *     Assignment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "a1b2c3d4"
 *         chat_id:
 *           type: string
 *           example: "chat123"
 *           nullable: true
 *         branch_id:
 *           type: integer
 *           example: 2
 *         organization_id:
 *           type: integer
 *           example: 1
 *         client_id:
 *           type: integer
 *           example: 10
 *         client_snapshot:
 *           $ref: '#/components/schemas/ClientInfo'
 *         service_id:
 *           type: integer
 *           example: 1
 *         service_snapshot:
 *           $ref: '#/components/schemas/ServiceInfo'
 *         assignment_date:
 *           type: string
 *           format: date
 *           example: "2025-10-15"
 *         start_time:
 *           type: string
 *           example: "10:00"
 *         end_time:
 *           type: string
 *           example: "11:00"
 *         manager_id:
 *           type: integer
 *           example: 3
 *           nullable: true
 *         manager_snapshot:
 *           $ref: '#/components/schemas/UserInfo'
 *           nullable: true
 *         employee_id:
 *           type: integer
 *           example: 5
 *         employee_snapshot:
 *           $ref: '#/components/schemas/UserInfo'
 *         timezone:
 *           type: string
 *           example: "Asia/Bishkek"
 *         status:
 *           type: string
 *           enum: [new, scheduled, completed, canceled]
 *           example: "new"
 *         additional_services:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ServiceInfo'
 *           nullable: true
 *         notes:
 *           type: string
 *           example: "Client requested extra service"
 *           nullable: true
 *         source:
 *           type: string
 *           example: "web_booking"
 *         discount:
 *           type: number
 *           example: 10
 *           nullable: true
 *         final_price:
 *           type: number
 *           example: 90
 *         total_duration:
 *           type: number
 *           example: 60
 *         payment_method:
 *           type: string
 *           example: "cash"
 *           nullable: true
 *         paid:
 *           type: string
 *           enum: [paid, unpaid, refund]
 *           example: "unpaid"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-15T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-15T10:00:00Z"
 *
 * /assignments:
 *   get:
 *     summary: Get all assignments
 *     tags:
 *       - Assignments
 *     responses:
 *       200:
 *         description: List of assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Assignment'
 *       500:
 *         description: Server error
 *
 * /assignments/{id}:
 *   get:
 *     summary: Get assignment by ID
 *     tags:
 *       - Assignments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "a1b2c3d4"
 *     responses:
 *       200:
 *         description: Assignment found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignment'
 *       404:
 *         description: Assignment not found
 *         content:
 *           application/json:
 *             example: { "error": "No Assignment found with this id" }
 *       500:
 *         description: Server error
 *
 * /assignments/calendar:
 *   post:
 *     summary: Create a new assignment
 *     tags:
 *       - Assignments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientAssignment
 *             properties:
 *               clientAssignment:
 *                 $ref: '#/components/schemas/Assignment'
 *     responses:
 *       200:
 *         description: Assignment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignment'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 *
 * /assignments/calendar/{id}:
 *   put:
 *     summary: Update an existing assignment
 *     tags:
 *       - Assignments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "a1b2c3d4"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientAssignment
 *             properties:
 *               clientAssignment:
 *                 $ref: '#/components/schemas/Assignment'
 *     responses:
 *       200:
 *         description: Assignment updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignment'
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 */


export default  AssignmentsServiceRoute;