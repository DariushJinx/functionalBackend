const OffController = require("../../../http/controllers/off/off.controller");

const OffRoutes = require("express").Router();

OffRoutes.post("/add", OffController.create);
OffRoutes.post("/get-one/:code", OffController.getOne);
OffRoutes.post("/set-all", OffController.setOnAll);
OffRoutes.get("/list", OffController.getAll);
OffRoutes.delete("/remove/:id", OffController.removeOff);

module.exports = OffRoutes;
