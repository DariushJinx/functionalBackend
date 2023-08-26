const NotificationRoutes = require("express").Router();
const NotificationController = require("../../../http/controllers/notification/notification.controller");
NotificationRoutes.post("/add", NotificationController.create);
NotificationRoutes.get("/all-notifications", NotificationController.getAllNotifications);
NotificationRoutes.patch("/see/:id", NotificationController.see);

module.exports = NotificationRoutes;
