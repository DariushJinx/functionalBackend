const BlogController = require("../../../http/controllers/blog/blog.controller");
const stringToArray = require("../../../http/middlewares/stringToArray");
const { uploadFile } = require("../../../utils/multer.utils");

const BlogRoutes = require("express").Router();

BlogRoutes.post(
  "/add",
  uploadFile.array("images", 10),
  stringToArray("tags"),
  BlogController.createBlog
);
BlogRoutes.patch(
  "/update/:id",
  uploadFile.array("images", 10),
  stringToArray("tags"),
  BlogController.updateBlog
);
BlogRoutes.get("/list", BlogController.getAllBlogs);
BlogRoutes.get("/get-one/:id", BlogController.getOneBlog);
BlogRoutes.delete("/remove/:id", BlogController.removeBlog);
BlogRoutes.get("/bookmark/:blogID", BlogController.bookmarkedBlogWithBlogID);
BlogRoutes.get("/like/:blogID", BlogController.likedBlog);
BlogRoutes.get("/dislike/:blogID", BlogController.dislikedBlog);
BlogRoutes.get("/search", BlogController.getBlogWithSearch);

module.exports = BlogRoutes;
