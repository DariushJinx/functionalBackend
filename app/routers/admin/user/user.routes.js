const UserController = require("../../../http/controllers/user/user.controller");

const UserRoutes = require("express").Router();


UserRoutes.patch(
  "/update-role",
  UserController.changeRoles
);
UserRoutes.post(
  "/ban/:id",
  UserController.banUser
);
UserRoutes.get(
  "/list",
  UserController.getAllUsers
);

module.exports = UserRoutes;
