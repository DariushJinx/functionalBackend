const CommentController = require("../../../http/controllers/comment/comment.controller");


const commentRoutes = require("express").Router();

commentRoutes.post("/add", CommentController.createComment);
commentRoutes.get(
  "/list",
  CommentController.getAllComments
);
commentRoutes.patch(
  "/show/:id",
  CommentController.showComment
);
commentRoutes.patch("/answer/:id", CommentController.createAnswer);
commentRoutes.delete(
  "/remove/:id",
  CommentController.removeComment
);

module.exports = commentRoutes;
