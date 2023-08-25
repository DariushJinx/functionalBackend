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
const CourseUserModel = require("../../models/course-user/course-user.model");
const CommentModel = require("../../models/comments/comment.model");
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
          .lean()
          .sort({ _id: -1 });
      else
        courses = await CourseModel.find({})
          .populate([
            { path: "category", select: { children: 0, parent: 0, __v: 0 } },
            { path: "teacher", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
          ])
          .lean()
          .sort({ _id: -1 });

      const registers = await CourseUserModel.find({});

      const comments = await CommentModel.find({ show: 1 })
        .populate([
          { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        ])
        .lean();

      let allCourses = [];
      courses.forEach(async (course) => {
        let courseTotalScore = 5;
        let courseRegisters = registers.filter((register) => {
          if (register.course.toString() === course._id.toString()) {
            return register;
          }
        });

        let courseScores = comments.filter((comment) => {
          if (comment.courseName) {
            if (comment.courseName.toString() === course._id.toString()) {
              return comment;
            }
          }
        });

        let courseComments = comments.filter((comment) => {
          if (comment.courseName) {
            if (comment.courseName.toString() === course._id.toString()) {
              return comment;
            }
          }
        });

        courseScores.forEach((comment) => {
          courseTotalScore += Number(comment.score);
        });

        allCourses.push({
          ...course,
          courseComments,
          courseAverageScore: Math.floor(courseTotalScore / (courseScores.length + 1)),
          registers: courseRegisters.length,
        });
      });

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: {
          message: "تمامی دوره های موجود با موفقیت بازگردانی شدند",
          allCourses,
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
  async getOne(req, res, next) {
    try {
      const { title } = req.params;
      const course = await CourseModel.findOne({ title: title })
        .populate([
          { path: "category", select: { title: 1 } },
          { path: "teacher", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        ])
        .lean();

      const comments = await CommentModel.find({ courseName: course._id, show: 1 })
        .populate([
          { path: "commentUser", select: { first_name: 1, last_name: 1, mobile: 1, email: 1 } },
        ])
        .lean();

      let courseTotalScore = 5;

      let courseScores = comments.filter((comment) => {
        if (comment.courseName) {
          if (comment.courseName.toString() === course._id.toString()) {
            return comment;
          }
        }
      });

      courseScores.forEach((comment) => {
        courseTotalScore += Number(comment.score);
      });

      let isUserRegisteredToThisCourse = null;
      if (req.user) {
        isUserRegisteredToThisCourse = !!(await CourseUserModel.findOne({
          user: req.user._id,
          course: course._id,
        }));
      } else {
        isUserRegisteredToThisCourse = false;
      }

      const courseStudentsCount = await CourseUserModel.find({
        course: course._id,
      }).count();

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: {
          ...course,
          comments,
          courseAverageScore: Math.floor(courseTotalScore / (courseScores.length + 1)),
          isUserRegisteredToThisCourse,
          courseStudentsCount,
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
        statusCode: HttpStatus.OK,
        data: {
          message: "دوره مورد نظر با موفقیت حذف شد",
        },
      });
    } catch (err) {
      next(err);
    }
  }
  async userRegisterCourse(req, res, next) {
    try {
      const { courseID } = req.params;
      const user = req.user;
      const course = await CourseModel.findOne({ _id: courseID }).lean();
      const isUserAlreadyRegistered = await CourseUserModel.findOne({
        user: user._id,
        course: courseID,
      }).lean();
      if (isUserAlreadyRegistered) {
        return res.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          data: {
            message: "شما قبلا در این دوره ثبت نام کرده اید",
          },
        });
      }
      await CourseUserModel.create({
        user: user._id,
        course: courseID,
        price: course.price,
      });
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        data: {
          message: "شما با موفقیت در دوره ثبت نام کردید",
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

const CourseController = new Course();

module.exports = CourseController;
