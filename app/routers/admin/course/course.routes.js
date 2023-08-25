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
CourseRoutes.post("/user-register-course/:courseID", CourseController.userRegisterCourse);
CourseRoutes.get("/list", CourseController.getListOfCourse); //get all course
CourseRoutes.delete("/remove/:id", CourseController.removeCourse); //remove course
CourseRoutes.get("/:title", CourseController.getOne); //get all course
CourseRoutes.patch("/update/:id", uploadFile.array("image", 10), CourseController.updateCourseById); // edit a course
CourseRoutes.get("/bookmark/:courseID", CourseController.bookmarkedCourseWithCourseID);
CourseRoutes.get("/like/:courseID", CourseController.likedCourse);
CourseRoutes.get("/dislike/:courseID", CourseController.dislikedCourse);
module.exports = CourseRoutes;
