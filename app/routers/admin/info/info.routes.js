const InfoController = require("../../../http/controllers/info/infos.controller");

const InfoRoutes = require("express").Router();

InfoRoutes.get("/p-admin", InfoController.getPAdmin);
InfoRoutes.get("/admins", InfoController.admins);

module.exports = InfoRoutes;
