import express from "express";
import cors from "cors";
import { connectDatabase } from "./src/database/db.js";
import User from "./model/user.js";
import Post from "./model/Post.js";
import Comment from "./model/Comment.js";
const app = express();
const PORT = 3003;

// Initialize database
connectDatabase()
  .then(() => {
    console.log("Database connected successfully!");

    // Define middleware
    app.use(cors());
    app.use(express.json());

    // Define routes
    // bai 1
    app.post("/api/v1/users", async (req, res) => {
      try {
        const { userName, email } = req.body;
        if (!userName) {
          throw new Error("userName is required!");
        }
        if (!email) {
          throw new Error("email is required!");
        }
        const existedEmail = await UsersModel.findOne({ email });
        if (existedEmail) {
          throw new Error("Email already exists!");
        }

        const createdUser = await UsersModel.create({ userName, email });

        res.status(201).json({
          data: createdUser,
          message: "Register successful!",
          success: true,
        });
      } catch (error) {
        res.status(403).json({
          message: error.message,
          data: null,
          success: false,
        });
      }
    });

    // bai 2
    app.post("/api/v1/posts", async (req, res) => {
      try {
        const { title, content, userId } = req.body;
        if (!title || !content || !userId) {
          throw new Error("Title, content, and userId are required!");
        }

        const post = await PostsModel.create({
          title,
          content,
          author: userId,
        });

        res.status(201).json({
          data: post,
          message: "Post created successfully!",
          success: true,
        });
      } catch (error) {
        res.status(403).json({
          message: error.message,
          data: null,
          success: false,
        });
      }
    });

    // bai 3
    app.put("/api/v1/posts/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { title, content, userId } = req.body;

        const post = await PostsModel.findById(id);
        if (!post) {
          throw new Error("Post not found!");
        }
        if (post.author.toString() !== userId) {
          throw new Error("Unauthorized to edit this post!");
        }

        post.title = title || post.title;
        post.content = content || post.content;
        await post.save();

        res.status(200).json({
          data: post,
          message: "Post updated successfully!",
          success: true,
        });
      } catch (error) {
        res.status(403).json({
          message: error.message,
          data: null,
          success: false,
        });
      }
    });

    // bai 4
    app.post("/api/v1/comments", async (req, res) => {
      try {
        const { content, userId, postId } = req.body;
        if (!content || !userId || !postId) {
          throw new Error("Content, userId, and postId are required!");
        }

        const comment = await CommentsModel.create({
          content,
          author: userId,
          post: postId,
        });

        res.status(201).json({
          data: comment,
          message: "Comment added successfully!",
          success: true,
        });
      } catch (error) {
        res.status(403).json({
          message: error.message,
          data: null,
          success: false,
        });
      }
    });

    // bai 5
    app.put("/api/v1/comments/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { content, userId } = req.body;

        const comment = await CommentsModel.findById(id);
        if (!comment) {
          throw new Error("Comment not found!");
        }
        if (comment.author.toString() !== userId) {
          throw new Error("Unauthorized to edit this comment!");
        }

        comment.content = content || comment.content;
        await comment.save();

        res.status(200).json({
          data: comment,
          message: "Comment updated successfully!",
          success: true,
        });
      } catch (error) {
        res.status(403).json({
          message: error.message,
          data: null,
          success: false,
        });
      }
    });

    // bai 6
    app.get("/api/v1/posts/:postId/comments", async (req, res) => {
      try {
        const { postId } = req.params;
        const comments = await CommentsModel.find({ post: postId }).populate(
          "author",
          "userName"
        );

        res.status(200).json({
          data: comments,
          message: "Comments retrieved successfully!",
          success: true,
        });
      } catch (error) {
        res.status(403).json({
          message: error.message,
          data: null,
          success: false,
        });
      }
    });

    // bai 7
    app.get("/api/v1/posts", async (req, res) => {
      try {
        const posts = await PostsModel.find().populate({
          path: "comments",
          options: { limit: 3 },
          populate: { path: "author", select: "userName" },
        });

        res.status(200).json({
          data: posts,
          message: "Posts retrieved successfully!",
          success: true,
        });
      } catch (error) {
        res.status(403).json({
          message: error.message,
          data: null,
          success: false,
        });
      }
    });

    // bai 8
    app.get("/api/v1/posts/:postId", async (req, res) => {
      try {
        const { postId } = req.params;
        const post = await PostsModel.findById(postId).populate({
          path: "comments",
          populate: { path: "author", select: "userName" },
        });

        if (!post) {
          throw new Error("Post not found!");
        }
        res.status(200).json({
          data: post,
          message: "Post retrieved successfully!",
          success: true,
        });
      } catch (error) {
        res.status(403).json({
          message: error.message,
          data: null,
          success: false,
        });
      }
    });
    // Run server
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database", err);
  });
