const Controller = require("../controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const { createCourseSchema } = require("../../validation/course/course.schema");
const createHttpError = require("http-errors");
const {
  copyObject,
  deleteInvalidPropertyInObject,
  ListOfImagesForRequest,
  findCourseById,
} = require("../../../utils/functions.utils");
const CourseModel = require("../../models/course/course.model");
const { default: mongoose } = require("mongoose");
class Course extends Controller {
  async getListOfCourse(req, res, next) {
    try {
      const { search } = req.query;
      let courses;
      if (search)
        courses = await CourseModel.find({ $text: { $search: search } })
          .populate([
            { path: "category", select: { title: 1 } },
            { path: "teacher", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
          ])
          .sort({ _id: -1 });
      else
        courses = await CourseModel.find({})
          .populate([
            { path: "category", select: { children: 0, prent: 0 } },
            { path: "teacher", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
          ])
          .sort({ _id: -1 });
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: {
          courses,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  async addCourse(req, res, next) {
    try {
      const validation = await createCourseSchema.validateAsync(req.body);
      const images = ListOfImagesForRequest(req?.files || [], validation.fileUploadPath);
      let { title, short_text, text, tags, category, price, discount = 0, type } = req.body;
      const teacher = req.user._id;
      if (Number(price) > 0 && type === "free")
        throw createHttpError.BadRequest("برای دوره ی رایگان نمیتوان قیمت ثبت کرد");
      const course = await CourseModel.create({
        title,
        short_text,
        text,
        tags,
        category,
        price,
        discount,
        type,
        images,
        status: "notStarted",
        teacher,
      });
      if (!course?._id) throw createHttpError.InternalServerError("دوره ثبت نشد");
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        data: {
          message: "دوره با موفقیت ایجاد شد",
          course,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      const course = await findCourseById(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: {
          course,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  async updateCourseById(req, res, next) {
    try {
      const { id } = req.params;
      await findCourseById(id);
      const data = copyObject(req.body);
      let blackListFields = [
        "time",
        "chapters",
        "episodes",
        "students",
        "bookmarks",
        "likes",
        "dislikes",
        "comments",
        "fileUploadPath",
        "filename",
      ];
      deleteInvalidPropertyInObject(data, blackListFields);
      if (req?.body?.fileUploadPath && req?.files) {
        ListOfImagesForRequest(req?.files || [], req.body.fileUploadPath);
      }
      const updateCourseResult = await CourseModel.updateOne(
        { _id: id },
        {
          $set: data,
        }
      );
      if (!updateCourseResult.modifiedCount)
        throw new createHttpError.InternalServerError("به روزرسانی دوره انجام نشد");

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: {
          message: "به روزرسانی دوره با موفقیت انجام شد",
        },
      });
    } catch (error) {
      next(error);
    }
  }
  async removeCourse(req, res, next) {
    try {
      const { id } = req.params;
      const findQuery = mongoose.isValidObjectId(id) ? { _id: id } : { title: id };
      const course = await CourseModel.findOne(findQuery);
      if (!course) throw createHttpError.NotFound("دوره مورد نظر یافت نشد");
      const removeResult = await CourseModel.deleteOne({ _id: course._id });
      if (!removeResult.deletedCount)
        throw createHttpError.InternalServerError("دوره مورد نظر حذف نشد");
      return res.status(HttpStatus.OK).json({
        statusCode : HttpStatus.OK,
        data : {
          message : "دوره مورد نظر با موفقیت حذف شد"
        }
      })
    } catch (err) {
      next(err);
    }
  }
}

const CourseController = new Course();

module.exports = CourseController;
