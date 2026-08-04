import express from "express";
import multer from "multer";
import { auth } from "../middlewares/auth.js";
import {
  generateArticle,
  generateBlogTitle,
  generateImage,
  removeBackground,
  removeObject,
  reviewResume,
  getUserCreations,
  getCommunityCreations,
  toggleLike,
  deleteCreation,
} from "../controllers/aiController.js";

const aiRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
});

aiRouter.get("/creations", auth, getUserCreations);
aiRouter.get("/community", auth, getCommunityCreations);

aiRouter.post("/generate-article", auth, generateArticle);
aiRouter.post("/generate-blog-title", auth, generateBlogTitle);
aiRouter.post("/generate-image", auth, generateImage);

aiRouter.post(
  "/remove-background",
  auth,
  upload.single("image"),
  removeBackground
);

aiRouter.post("/remove-object", auth, upload.single("image"), removeObject);

aiRouter.post("/review-resume", auth, upload.single("resume"), reviewResume);

aiRouter.post("/like", auth, toggleLike);

aiRouter.delete("/creations/:id", auth, deleteCreation);

export default aiRouter;
