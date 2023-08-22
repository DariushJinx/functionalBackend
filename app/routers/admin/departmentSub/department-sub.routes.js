const DepartmentSubController = require("../../../http/controllers/departmentSub/department-sub.controller");

const DepartmentSubRoutes = require("express").Router();

DepartmentSubRoutes.post("/add", DepartmentSubController.createDepartmentSub);
DepartmentSubRoutes.get("/list", DepartmentSubController.listOfDepartmentSub);
DepartmentSubRoutes.patch(
  "/update/:field",
  DepartmentSubController.updateDepartmentSub
);
DepartmentSubRoutes.delete(
  "/remove/:field",
  DepartmentSubController.removeDepartmentSub
);

module.exports = DepartmentSubRoutes;
