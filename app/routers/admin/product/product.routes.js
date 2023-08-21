const ProductController = require("../../../http/controllers/product/product.controller");
const stringToArray = require("../../../http/middlewares/stringToArray");
const { uploadFile } = require("../../../utils/multer.utils");

const ProductRoutes = require("express").Router();

ProductRoutes.post(
  "/add",
  uploadFile.array("images", 10),
  stringToArray("tags", "colors"),
  ProductController.addProduct
);
ProductRoutes.get("/list", ProductController.listOfProduct);
ProductRoutes.get("/search", ProductController.searchOfProduct);
ProductRoutes.patch("/add-features/:field", ProductController.addFeaturesForProduct);
ProductRoutes.patch("/remove-feature/:productID", ProductController.removeFeature);
ProductRoutes.delete("/remove-product/:field", ProductController.removeProduct);
ProductRoutes.patch(
  "/update-product/:field",
  uploadFile.array("images", 10),
  stringToArray("tags", "colors"),
  ProductController.updateProduct
);
ProductRoutes.get("/:field", ProductController.getOneProduct);
ProductRoutes.get("/like/:productID", ProductController.likedProduct);
ProductRoutes.get("/dislike/:productID", ProductController.dislikedProduct);
ProductRoutes.get("/bookmark/:productID", ProductController.bookmarkedProduct);
module.exports = ProductRoutes;
