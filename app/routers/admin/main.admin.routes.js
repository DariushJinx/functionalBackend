const { verifyAccessToken } = require("../../http/middlewares/verifyAccessToken.middleware");
const BlogRoutes = require("./blog/blog.routes");
const CategoryRoutes = require("./category/category.routes");

const MainAdminRoutes = require("express").Router();

MainAdminRoutes.use("/category", CategoryRoutes);
MainAdminRoutes.use("/blog",verifyAccessToken, BlogRoutes);

module.exports = MainAdminRoutes;
