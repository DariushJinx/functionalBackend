const CommentController = require("../../../http/controllers/comment/comment.controller");

const commentRoutes = require("express").Router();

commentRoutes.post("/add-comment-blog", CommentController.createCommentForBlog);
commentRoutes.post("/add-comment-course", CommentController.createCommentForCourse);
commentRoutes.post("/add-comment-product", CommentController.createCommentForProduct);
commentRoutes.get("/list", CommentController.getAllComments);
commentRoutes.patch("/show/:id", CommentController.showComment);
commentRoutes.patch("/answer/:id", CommentController.createAnswer);
commentRoutes.delete("/remove/:id", CommentController.removeComment);

module.exports = commentRoutes;
