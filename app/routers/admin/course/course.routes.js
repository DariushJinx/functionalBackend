const CourseController = require("../../../http/controllers/course/course.controller");
const stringToArray = require("../../../http/middlewares/stringToArray");
const { uploadFile } = require("../../../utils/multer.utils");

const CourseRoutes = require("express").Router();
CourseRoutes.post(
  "/add",
  uploadFile.array("images", 10),
  stringToArray("tags"),
  CourseController.addCourse
);
CourseRoutes.get("/list", CourseController.getListOfCourse); //get all course
CourseRoutes.delete("/remove/:id", CourseController.removeCourse); //remove course
CourseRoutes.get("/:id", CourseController.getCourseById); //get all course
CourseRoutes.patch("/update/:id", uploadFile.array("image", 10), CourseController.updateCourseById); // edit a course
module.exports = CourseRoutes;
