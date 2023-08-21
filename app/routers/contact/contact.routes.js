const ContactController = require("../../http/controllers/contact/contact.controller");
const ContactRoutes = require("express").Router();

ContactRoutes.post("/add", ContactController.createContact);
ContactRoutes.get("/list", ContactController.getAllContact);
ContactRoutes.delete("/remove/:id", ContactController.removeContact);
ContactRoutes.post("/answer", ContactController.answerContact);

module.exports = ContactRoutes;
