import OpenAI from "openai";
import FormData from "form-data";

import { clerkClient, getAuth } from "@clerk/express";

import sql from "../configs/db.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import { PDFParse } from "pdf-parse";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  timeout: 60000,
  maxRetries: 1,
});

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const FREE_LIMIT = Number(process.env.FREE_LIMIT) || 10;
const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY;
const CLIPDROP_BASE = "https://clipdrop-api.co";

export const checkFreeLimit = (plan, freeUsage) =>
  plan !== "premium" && freeUsage >= FREE_LIMIT;

const extractError = (error) => {
  if (error.response?.data) {
    const raw = Buffer.isBuffer(error.response.data)
      ? error.response.data.toString("utf8")
      : error.response.data;
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return parsed.error?.message || parsed.error || parsed.message || error.response.statusText || error.message;
    } catch {
      return raw || error.message;
    }
  }
  return error.message;
};

const fail = (res, message) => res.json({ success: false, message });

const incrementUsage = async (userId, plan, freeUsage) => {
  if (plan === "premium") return freeUsage;
  const updated = (freeUsage || 0) + 1;
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: { free_usage: updated },
  });
  return updated;
};

const uploadImage = async (base64Image, folder) => {
  try {
    const { secure_url } = await cloudinary.uploader.upload(base64Image, {
      folder,
    });
    return secure_url;
  } catch (cloudError) {
    console.warn(
      "Cloudinary upload failed, storing base64 image instead:",
      cloudError.message
    );
    return base64Image;
  }
};

const processClipdropImage = async (endpoint, form) => {
  const response = await axios.post(`${CLIPDROP_BASE}/${endpoint}/v1`, form, {
    headers: {
      "x-api-key": CLIPDROP_API_KEY,
      ...form.getHeaders(),
    },
    responseType: "arraybuffer",
    timeout: 60000,
  });

  const contentType = response.headers["content-type"] || "";

  if (response.status !== 200 || !contentType.includes("image")) {
    const message = Buffer.from(response.data).toString("utf8");
    try {
      throw new Error(JSON.parse(message).error || "Failed to process image");
    } catch {
      throw new Error(message || "Failed to process image");
    }
  }

  return `data:image/png;base64,${Buffer.from(response.data).toString("base64")}`;
};

export const generateArticle = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { prompt, length } = req.body;
    const { plan, free_usage } = req;

    if (!prompt || !prompt.trim()) return fail(res, "Prompt is required");
    if (checkFreeLimit(plan, free_usage))
      return fail(res, "Limit reached. Upgrade to continue");

    const wordCount = Number(length) || 800;
    const maxTokens = Math.min(8192, Math.max(2048, Math.round(wordCount * 1.5)));

    const response = await openai.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional blog writer. Write a complete, long-form article based on the user's topic. The article must be thorough, well-structured, and match the requested word count as closely as possible. Use a compelling title (as a heading), a strong introduction, multiple sections with ## headings, bullet points where appropriate, and a conclusion. Do not summarize or cut the article short. Write in a clear, engaging, professional tone. Do not include any introductory filler like 'Here is the article' or 'Sure, here you go'. Start directly with the title and content.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    const newUsage = await incrementUsage(userId, plan, free_usage);

    res.json({ success: true, content, free_usage: newUsage });
  } catch (error) {
    console.error("generateArticle error:", extractError(error));
    fail(res, extractError(error));
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { prompt } = req.body;
    const { plan, free_usage } = req;

    if (!prompt || !prompt.trim()) return fail(res, "Prompt is required");
    if (checkFreeLimit(plan, free_usage))
      return fail(res, "Limit reached. Upgrade to continue");

    const response = await openai.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    const newUsage = await incrementUsage(userId, plan, free_usage);

    res.json({ success: true, content, free_usage: newUsage });
  } catch (error) {
    console.error("generateBlogTitle error:", extractError(error));
    fail(res, extractError(error));
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { prompt, publish } = req.body;
    const { plan } = req;

    if (plan !== "premium") {
      return fail(res, "This feature is only available for premium subscriptions");
    }

    if (!prompt || !prompt.trim()) return fail(res, "Prompt is required");

    if (!CLIPDROP_API_KEY) {
      return fail(res, "CLIPDROP_API_KEY is not configured");
    }

    const form = new FormData();
    form.append("prompt", prompt.trim().slice(0, 1000));

    const base64Image = await processClipdropImage("text-to-image", form);

    const content = await uploadImage(base64Image, "ai-images");

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${content}, 'image', ${publish ?? false})
    `;

    return res.json({ success: true, content });
  } catch (error) {
    console.error("generateImage error:", extractError(error));
    return fail(res, extractError(error));
  }
};

export const removeBackground = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { plan } = req;

    if (plan !== "premium") {
      return fail(res, "This feature is only available for premium subscriptions");
    }
    if (!req.file) return fail(res, "Image is required");
    if (!CLIPDROP_API_KEY) return fail(res, "CLIPDROP_API_KEY is not configured");

    const form = new FormData();
    form.append("image_file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const base64Image = await processClipdropImage("remove-background", form);
    const content = await uploadImage(base64Image, "ai-images");

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${"Remove background from the uploaded image"}, ${content}, 'remove-background')
    `;

    res.json({ success: true, content });
  } catch (error) {
    console.error("removeBackground error:", extractError(error));
    fail(res, extractError(error));
  }
};

export const removeObject = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { plan } = req;
    const { object } = req.body;

    if (plan !== "premium") {
      return fail(res, "This feature is only available for premium subscriptions");
    }
    if (!req.file) return fail(res, "Image is required");
    if (!CLIPDROP_API_KEY) return fail(res, "CLIPDROP_API_KEY is not configured");

    const prompt = object?.trim()
      ? `Remove the object "${object.trim()}" from the uploaded image`
      : "Remove unwanted objects from the uploaded image";

    const form = new FormData();
    form.append("image_file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const base64Image = await processClipdropImage("remove-text", form);
    const content = await uploadImage(base64Image, "ai-images");

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'remove-object')
    `;

    res.json({ success: true, content });
  } catch (error) {
    console.error("removeObject error:", extractError(error));
    fail(res, extractError(error));
  }
};

export const reviewResume = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { plan, free_usage } = req;

    if (!req.file) return fail(res, "Resume (PDF) is required");
    if (req.file.mimetype !== "application/pdf")
      return fail(res, "Only PDF resumes are supported");
    if (checkFreeLimit(plan, free_usage))
      return fail(res, "Limit reached. Upgrade to continue");

    const parser = new PDFParse({ data: req.file.buffer });
    let resumeText = "";
    try {
      const result = await parser.getText();
      resumeText = result?.text || "";
    } finally {
      await parser.destroy();
    }

    if (!resumeText.trim())
      return fail(res, "Could not extract text from the PDF. Please try another file.");

    const response = await openai.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume reviewer. Analyze the provided resume and give a detailed review including: overall summary, strengths, weaknesses, missing sections, formatting suggestions, and specific actionable improvements. Use markdown headings and bullet points.",
        },
        { role: "user", content: resumeText.slice(0, 20000) },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${"Resume review analysis"}, ${content}, 'resume')
    `;

    const newUsage = await incrementUsage(userId, plan, free_usage);

    res.json({ success: true, content, free_usage: newUsage });
  } catch (error) {
    console.error("reviewResume error:", extractError(error));
    fail(res, extractError(error));
  }
};

export const getUserCreations = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const creations = await sql`
      SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC
    `;
    res.json({
      success: true,
      creations,
      plan: req.plan,
      free_usage: req.free_usage,
    });
  } catch (error) {
    console.error("getUserCreations error:", extractError(error));
    fail(res, extractError(error));
  }
};

export const getCommunityCreations = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const creations = await sql`
      SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC LIMIT 50
    `;

    const creatorIds = [...new Set(creations.map((c) => c.user_id))];
    let userMap = new Map();
    try {
      const users = await clerkClient.users.getUserList({
        userId: creatorIds,
        limit: 100,
      });
      const list = Array.isArray(users) ? users : users.data;
      userMap = new Map(
        list.map((u) => [
          u.id,
          { name: u.fullName || u.username || "Anonymous", image: u.imageUrl },
        ])
      );
    } catch (e) {
      console.warn("Failed to fetch creators:", e.message);
    }

    const data = creations.map((c) => ({
      ...c,
      author: userMap.get(c.user_id) || { name: "Anonymous", image: null },
    }));

    res.json({ success: true, creations: data, currentUserId: userId });
  } catch (error) {
    console.error("getCommunityCreations error:", extractError(error));
    fail(res, extractError(error));
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { creationId } = req.body;

    if (!creationId) return fail(res, "creationId is required");

    const [creation] = await sql`
      SELECT likes FROM creations WHERE id = ${creationId} AND publish = true
    `;
    if (!creation) return fail(res, "Creation not found");

    const likes = Array.isArray(creation.likes) ? creation.likes : [];
    const hasLiked = likes.includes(userId);
    const newLikes = hasLiked
      ? likes.filter((id) => id !== userId)
      : [...likes, userId];

    const [updated] = await sql`
      UPDATE creations SET likes = ${newLikes}, updated_at = now()
      WHERE id = ${creationId}
      RETURNING likes
    `;

    res.json({
      success: true,
      likes: updated.likes,
      liked: !hasLiked,
    });
  } catch (error) {
    console.error("toggleLike error:", extractError(error));
    fail(res, extractError(error));
  }
};

export const deleteCreation = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { id } = req.params;

    const result = await sql`
      DELETE FROM creations WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (!result.length) return fail(res, "Creation not found");

    res.json({ success: true });
  } catch (error) {
    console.error("deleteCreation error:", extractError(error));
    fail(res, extractError(error));
  }
};
