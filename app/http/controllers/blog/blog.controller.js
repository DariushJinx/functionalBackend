const createHttpError = require("http-errors");
const BlogModel = require("../../models/blog/blog.model");
const CreateBlogValidation = require("../../validation/blog/blog.validation");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const {
  ListOfImagesForRequest,
  deleteFileInPublic,
  copyObject,
  deleteInvalidPropertyInObject,
} = require("../../../utils/functions.utils");
const { default: mongoose } = require("mongoose");

exports.createBlog = async (req, res, next) => {
  try {
    const validation = await CreateBlogValidation.validateAsync(req.body);
    const images = ListOfImagesForRequest(req?.files || [], req.body.fileUploadPath);
    const { title, text, short_text, tags, category } = validation;
    const author = req.user._id;
    const blog = await BlogModel.create({
      title,
      text,
      short_text,
      tags,
      category,
      author,
      images,
    });
    if (!blog) throw createHttpError.InternalServerError("مقاله مورد نظر با موفقیت ایجاد نشد");
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: {
        message: "مقاله مورد نظر با موفقیت ایجاد شد",
        blog,
      },
    });
  } catch (err) {
    deleteFileInPublic(req.body.images);
    next(err);
  }
};

exports.getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await BlogModel.find({})
      .populate([
        {
          path: "author",
          select: {
            first_name: 1,
            last_name: 1,
            username: 1,
            role: 1,
            _id: 0,
          },
        },
        {
          path: "category",
          select: { title: 1, _id: 0 },
        },
        {
          path: "likes",
          select: {
            first_name: 1,
            last_name: 1,
            username: 1,
            role: 1,
            _id: 0,
          },
        },
        {
          path: "dislikes",
          select: {
            first_name: 1,
            last_name: 1,
            username: 1,
            role: 1,
            _id: 0,
          },
        },
        {
          path: "bookmarks",
          select: {
            first_name: 1,
            last_name: 1,
            username: 1,
            role: 1,
            _id: 0,
          },
        },
      ])
      .lean();
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "تمامی مقاله های موجود با موفقیت بازگردانده شدند",
        blogs,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOneBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const findBlog = await findBlogWithTitleOrID(id);
    const blog = await BlogModel.aggregate([
      {
        $match: { _id: findBlog._id },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "author",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $lookup: {
          from: "categories",
          foreignField: "_id",
          localField: "category",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          "category.__v": 0,
          "author.otp": 0,
          "author.__v": 0,
          "author.role": 0,
          "author.discount": 0,
          "author.bills": 0,
        },
      },
    ]);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "مقاله مورد نظر با موفقیت بازگردانده شد",
        blog,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getBlogWithSearch = async (req, res, next) => {
  try {
    const { search } = req?.query;
    const dataQuery = {};
    if (search) dataQuery["$text"] = { $search: search };
    // const users = await UserModel.find(dataQuery,{"otp.expiresIn" : 0});
    const blogSearch = await BlogModel.find(dataQuery)
      .populate([
        {
          path: "author",
          select: { first_name: 1, last_name: 1, username: 1, role: 1 },
        },
        {
          path: "category",
          select: { title: 1 },
        },
        {
          path: "likes",
          select: { first_name: 1, last_name: 1, username: 1, role: 1 },
        },
        {
          path: "dislikes",
          select: { first_name: 1, last_name: 1, username: 1, role: 1 },
        },
        {
          path: "bookmarks",
          select: { first_name: 1, last_name: 1, username: 1, role: 1 },
        },
      ])
      .lean();

    if (!blogSearch) throw createHttpError.NotFound("مقاله مورد نظر یافت نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "مقاله مورد نظر با موفقیت بازگردانی شد",
        blogSearch,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.removeBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await findBlogWithTitleOrID(id);
    const removeResult = await BlogModel.deleteOne({ _id: blog._id });
    if (!removeResult.deletedCount)
      throw createHttpError.InternalServerError("مقاله مورد نظر با موفقیت حذف نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "مقاله مورد نظر با موفقیت حذف شد",
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await findBlogWithTitleOrID(id);
    if (req?.body?.fileUploadPath && req?.files) {
      ListOfImagesForRequest(req?.files || [], req.body.fileUploadPath);
    }
    let blackListFields = ["likes", "dislikes", "bookmarks", "comments", "author"];
    const data = copyObject(req.body);
    deleteInvalidPropertyInObject(data, blackListFields);
    const updateResult = await BlogModel.updateOne({ _id: blog._id }, { $set: data });
    if (!updateResult.modifiedCount)
      throw createHttpError.InternalServerError("مقاله مورد نظر با موفقیت به روزرسانی نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "مقاله مورد نظر با موفقیت به روزرسانی شد",
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.bookmarkedBlogWithBlogID = async (req, res, next) => {
  try {
    const { blogID } = req.params;
    await findBlogWithTitleOrID(blogID);
    const user = req.user;
    const bookmarkedBlog = await BlogModel.findOne({
      _id: blogID,
      bookmarks: user._id,
    });
    const updateQuery = bookmarkedBlog
      ? { $pull: { bookmarks: user._id } }
      : { $push: { bookmarks: user._id } };
    await BlogModel.updateOne({ _id: blogID }, updateQuery);
    let message;
    if (!bookmarkedBlog) message = "مقاله مورد نظر به لیست علاقه مندی های شما اضافه شد";
    else message = "مقاله مورد نظر از لیست علاقه مندی های شما حذف شد";
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.likedBlog = async (req, res, next) => {
  try {
    const { blogID } = req.params;
    await findBlogWithTitleOrID(blogID);
    const user = req.user;
    const likedBlog = await BlogModel.findOne({
      _id: blogID,
      likes: user._id,
    });
    const dislikedBlog = await BlogModel.findOne({
      _id: blogID,
      dislikes: user._id,
    });
    const updateQueryForLikes = likedBlog
      ? { $pull: { likes: user._id } }
      : { $push: { likes: user._id } };
    const updateQueryForDislikes = dislikedBlog && {
      $pull: { dislikes: user._id },
    };
    await BlogModel.updateOne({ _id: blogID }, updateQueryForLikes);
    let message;
    if (!likedBlog) {
      if (dislikedBlog) await BlogModel.updateOne({ _id: blogID }, updateQueryForDislikes);
      message = "پسندیدن مقاله با موفقیت انجام شد";
    } else message = "پسندیدن مقاله با موفقیت لغو شد";
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.dislikedBlog = async (req, res, next) => {
  try {
    const { blogID } = req.params;
    await findBlogWithTitleOrID(blogID);
    const user = req.user;
    const likesBlog = await BlogModel.findOne({
      _id: blogID,
      likes: user._id,
    });
    const dislikesBlog = await BlogModel.findOne({
      _id: blogID,
      dislikes: user._id,
    });
    const updateQueryForDislikes = dislikesBlog
      ? { $pull: { dislikes: user._id } }
      : { $push: { dislikes: user._id } };
    const updateQueryForLikes = likesBlog && {
      $pull: { likes: user._id },
    };
    await BlogModel.updateOne({ _id: blogID }, updateQueryForDislikes);
    let message;
    if (!dislikesBlog) {
      if (likesBlog) await BlogModel.updateOne({ _id: blogID }, updateQueryForLikes);
      message = "نپسندیدن مقاله با موفقیت انجام شد";
    } else message = "نپسندیدن مقاله با موفقیت لغو شد";
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message,
      },
    });
  } catch (err) {
    next(err);
  }
};

const findBlogWithTitleOrID = async (field) => {
  const findQuery = mongoose.isValidObjectId(field) ? { _id: field } : { title: field };
  const category = await BlogModel.findOne(findQuery);
  if (!category) throw createHttpError.NotFound("دسته بندی مورد نظر یافت نشد");
  return category;
};
