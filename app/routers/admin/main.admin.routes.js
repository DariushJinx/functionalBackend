const { verifyAccessToken } = require("../../http/middlewares/verifyAccessToken.middleware");
const BlogRoutes = require("./blog/blog.routes");
const CategoryRoutes = require("./category/category.routes");
const commentRoutes = require("./comment/comment.routes");
const ProductRoutes = require("./product/product.routes");
const UserRoutes = require("./user/user.routes");

const MainAdminRoutes = require("express").Router();

MainAdminRoutes.use("/category", CategoryRoutes);
MainAdminRoutes.use("/blog", verifyAccessToken, BlogRoutes);
MainAdminRoutes.use("/product", verifyAccessToken, ProductRoutes);
MainAdminRoutes.use("/user", verifyAccessToken, UserRoutes);
MainAdminRoutes.use("/comment", verifyAccessToken, commentRoutes);

module.exports = MainAdminRoutes;
