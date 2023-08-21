const createHttpError = require("http-errors");
const BlogModel = require("../../models/blog/blog.model");
const CommentModel = require("../../models/comments/comment.model");
const ProductModel = require("../../models/product/product.model");
const CreateCommentValidation = require("../../validation/comment/comment.validation");
const { StatusCodes: HttpStatus } = require("http-status-codes");

exports.createComment = async (req, res, next) => {
  try {
    const validation = await CreateCommentValidation.validateAsync(req.body);
    const { comment, blogName, productName } = validation;
    const user = req.user;
    const blog = await BlogModel.findOne({ title: blogName });
    const product = await ProductModel.findOne({ title: productName });
    if (blog) {
      const createCommentForBlog = await CommentModel.create({
        comment,
        blogName: blog._id,
        commentUser: user._id,
      });
      if (!createCommentForBlog)
        throw createHttpError.InternalServerError("کامنت برای مقاله مورد نظر ایجاد نشد");
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        data: {
          message: "کامنت برای مقاله مورد نظر ایجاد شد",
          createCommentForBlog,
        },
      });
    }

    if (product) {
      const createCommentForProduct = await CommentModel.create({
        comment,
        productName: product._id,
        commentUser: user._id,
      });
      if (!createCommentForProduct)
        throw createHttpError.InternalServerError("کامنت برای محصول مورد نظر ایجاد نشد");
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        data: {
          message: "کامنت مورد نظر ایجاد شد",
          createCommentForProduct,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.createAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validation = await CreateCommentValidation.validateAsync(req.body);
    const { comment } = validation;
    const user = req.user;
    const commentResult = await CommentModel.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          answers: {
            comment,
            user: user._id,
          },
        },
      }
    );
    if (!commentResult.modifiedPaths)
      throw createHttpError.InternalServerError("پاسخ کامنت مورد نظر با موفقیت ثبت نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "پاسخ کامنت مورد نظر با موفقیت ثبت شد",
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllComments = async (req, res, next) => {
  try {
    const comments = await CommentModel.find({})
      .populate([
        {
          path: "commentUser",
          select: { first_name: 1, last_name: 1, email: 1, role: 1, _id: 0 },
        },
        {
          path: "answers",
          populate: {
            path: "AnswerUser",
            select: {
              first_name: 1,
              last_name: 1,
              email: 1,
              role: 1,
              _id: 0,
            },
          },
        },

        {
          path: "productName",
          select: { title: 1, _id: 0 },
        },
        {
          path: "blogName",
          select: { title: 1, _id: 0 },
        },
      ])
      .lean();

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "تمامی کامنت های موجود با موفقیت بازگردانده شدند",
        comments,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.showComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateResult = await CommentModel.updateOne({ _id: id }, { show: 1 });
    if (!updateResult.modifiedCount)
      throw createHttpError.InternalServerError("حالت مشاهده کامنت فعال نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "حالت مشاهده کامنت فعال شد",
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.removeComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removeResult = await CommentModel.findOneAndDelete({ _id: id });
    if (!removeResult.modifiedPaths)
      createHttpError.InternalServerError("کامنت مورد نظر با موفقیت حذف نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "کامنت مورد نظر با موفقیت حذف شد",
      },
    });
  } catch (err) {
    next(err);
  }
};
