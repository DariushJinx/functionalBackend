const CategoryController = require("../../../http/controllers/category/category.controller");
const { uploadFile } = require("../../../utils/multer.utils");

const CategoryRoutes = require("express").Router();

CategoryRoutes.post(
  "/add",
  uploadFile.array("images", 1),
  CategoryController.addCategory
);
CategoryRoutes.get("/list", CategoryController.getAllCategories);
CategoryRoutes.get("/getOne/:field", CategoryController.getOneCategory);
CategoryRoutes.get("/children/:parent", CategoryController.getChildrenOfParent);
CategoryRoutes.delete("/remove/:field", CategoryController.removeCategory);
CategoryRoutes.patch(
  "/update/:field",
  uploadFile.array("images", 1),
  CategoryController.updateCategoryTitle
);

module.exports = CategoryRoutes;
