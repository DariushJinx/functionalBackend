const { uploadVideo } = require("../../../utils/multer.utils");
const EpisodeController = require("../../../http/controllers/course/episode.controller");


const EpisodeRoutes = require("express").Router();
EpisodeRoutes.post("/add", uploadVideo.single("video"), EpisodeController.addNewEpisode);
EpisodeRoutes.patch("/remove/:episodeID", EpisodeController.removeEpisode);
EpisodeRoutes.patch(
  "/update/:episodeID",
  uploadVideo.single("video"),
  EpisodeController.updateEpisode
);
module.exports = EpisodeRoutes;