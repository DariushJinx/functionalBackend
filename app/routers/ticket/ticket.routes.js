const TicketController = require("../../http/controllers/ticket/ticket.conteroller");

const TicketRoutes = require("express").Router();

TicketRoutes.post("/add", TicketController.createTicket);
TicketRoutes.post("/set-answer", TicketController.setAnswer);
TicketRoutes.get("/list", TicketController.listOfTicket);
TicketRoutes.get("/get-answer/:id", TicketController.getAnswer);
TicketRoutes.get("/list-of-user", TicketController.userTickets);

module.exports = TicketRoutes;
