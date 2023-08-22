const DepartmentController = require("../../../http/controllers/department/department.controller");

const DepartmentRoutes = require("express").Router();

DepartmentRoutes.post("/add", DepartmentController.createDepartment);
DepartmentRoutes.get("/list", DepartmentController.listOfDepartments);

DepartmentRoutes.delete(
  "/remove/:field",
  DepartmentController.removeDepartment
);
DepartmentRoutes.patch("/update/:field", DepartmentController.updateDepartment);

module.exports = DepartmentRoutes;
