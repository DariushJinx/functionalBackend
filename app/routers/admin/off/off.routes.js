const OffController = require("../../../http/controllers/off/off.controller");

const OffRoutes = require("express").Router();

OffRoutes.post("/add-product", OffController.createForProduct);
OffRoutes.post("/add-course", OffController.createForCourse);
OffRoutes.post("/get-one-product/:code", OffController.getOneForProduct);
OffRoutes.post("/get-one-course/:code", OffController.getOneForCourse);
OffRoutes.post("/set-all", OffController.setOnAll);
OffRoutes.get("/list", OffController.getAll);
OffRoutes.delete("/remove/:id", OffController.removeOff);

module.exports = OffRoutes;
