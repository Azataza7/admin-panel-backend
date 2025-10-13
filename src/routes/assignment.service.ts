import express from "express";
import Assignment from "../models/Assignment.ts";

const AssignmentsServiceRoute = express.Router();

AssignmentsServiceRoute.get("/", (req, res, next) => {
  try {
    const assignment = Assignment.findAll();
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

AssignmentsServiceRoute.post("/client-create", (req, res, next) => {
  try {

  } catch (e) {
    console.log(e);
  }
});

AssignmentsServiceRoute.post("/calendar", async (req, res, next) => {
  try {
    const {
      clientAssignment
    } = req.body;

    const assignment = await Assignment.create({
      id: clientAssignment.id,
      chat_id: clientAssignment.chat_id || null,
      branch_id: clientAssignment.branch_id,
      organization_id: clientAssignment.organization_id,
      client_id: clientAssignment.client_id,
      client: clientAssignment.client,
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

export default  AssignmentsServiceRoute;