const ChapterController = require("../../../http/controllers/course/chapter.controller");

const ChapterRoutes = require("express").Router();
ChapterRoutes.put("/add", ChapterController.addChapter); //create new chapter
ChapterRoutes.get("/list/:courseID", ChapterController.chaptersOfCourse); //create new chapter
ChapterRoutes.patch("/remove/:chapterID", ChapterController.removeChapterById); //create new chapter
ChapterRoutes.patch("/update/:chapterID", ChapterController.updateChapterById); //create new chapter
module.exports = ChapterRoutes;
