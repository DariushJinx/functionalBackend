const PermissionController = require("../../../http/controllers/RBAC/permission.controller");

const PermissionRoutes = require("express").Router();

PermissionRoutes.post("/add", PermissionController.createNewPermission);
PermissionRoutes.get("/list", PermissionController.getAllPermission);
PermissionRoutes.delete("/remove/:id", PermissionController.removePermission);
PermissionRoutes.patch("/update/:id", PermissionController.updatePermission);

module.exports = PermissionRoutes;
