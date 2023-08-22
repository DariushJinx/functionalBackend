const RoleController = require("../../../http/controllers/RBAC/role.controller");

const stringToArray = require("../../../http/middlewares/stringToArray");

const RoleRoutes = require("express").Router();

RoleRoutes.post(
  "/add",
  stringToArray("permissions"),
  RoleController.createNewRole
);
RoleRoutes.get("/list", RoleController.getAllRoles);
RoleRoutes.delete("/remove/:field", RoleController.removeRole);
RoleRoutes.patch(
  "/update/:field",
  stringToArray("permissions"),
  RoleController.updateRole
);

module.exports = RoleRoutes;
