import express from "express";
import { v4 as uuidv4 } from "uuid";
const app = express();
app.use(express.json());
const port = 8003;
// bai 1
app.post("/users", async (req, res) => {
  try {
    const { userName, email } = req.body;

    if (!userName || !email) {
      return res.status(400).json({ error: "Invalid username or email" });
    }
    const drawEmail = await fetch(`http://localhost:3000/users!email=${email}`);
    const emailExist = await drawEmail.json();

    const drawUserName = await fetch(
      `http://localhost:3000/users!email=${email}`
    );
    const userNameExist = await drawUserName.json();
    if (emailExist.length > 0 || userNameExist.length > 0) {
      return res.status(400).json({
        error: "email or username already exists",
      });
    }

    //   insert new user
    const newUser = {
      id: uuidv4(),
      userName,
      email,
      age: Math.random,
      avatar: "",
    };
    const respone = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    const createdUser = await respone.json();

    res.status(201).send({
      message: "thanh cong",
      user: createdUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "that bai roi",
      data: null,
      error,
    });
  }
});

// bai2

app.post("/posts", async (req, res) => {
  try {
    const { userId, content, isPublic } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: "ko ton tai user hay nd" });
    }

    // kt user ton tai
    const userRespone = await fetch(`http://localhost:3000/users?id=${userId}`);
    const user = await userRespone.json();
    if (user.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    // tao bai viet moi

    const newPost = {
      id: uuidv4(),
      userId,
      content,
      createdAt: new Date(),
      isPublic: isPublic || false,
    };

    const response = await fetch(`http://localhost:3000/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    });
    const createdPost = await response.json();
    res
      .status(201)
      .json({ message: `created post successfully!!`, post: createdPost });
  } catch (error) {
    res.status(500).json({
      message: "that bai roi",
      data: null,
      error,
    });
  }
});

// bai3

app.put("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, content, isPublic } = req.body;

    const postRespone = await fetch(`http://localhost:3000/posts`);
    const post = await postRespone.json();

    if (post.length === 0) {
      return res.status(404).json({ error: "ko thay post" });
    }

    // kt user phai la chu nhan cua bi post ko

    if (post[0].userId === userId) {
      return res
        .status(400)
        .json({ error: "ban k phai chu nhan cua bai post nay" });
    }

    // update post
    const updatedPost = {
      id: uuidv4(),
      userId,
      createdAt: new Date(),
      content: content || post[0].content,
      isPublic: isPublic || false,
    };
    const respone = await fetch(`http://localhost:3000/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPost),
    });

    const editPost = await respone.json();
    res
      .status(200)
      .json({ message: "post cap nhat thanh cong", post: editPost });
  } catch (error) {
    res.status(500).json({ error: "ko the tao bai post" });
  }
});

// bai4

app.post("/comments", async (req, res) => {
  try {
    const { postId, userId, content } = req.body;

    if (!postId || !userId || !content) {
      return res.status(404).json({ error: "ko hop le" });
    }

    // kt bai viet co ton tai
    const postRespone = await fetch(`http://localhost:3000/post?id=${postId}`);
    const post = await postRespone.json();
    if (post.length === 0) {
      return res.status(400).json({ error: "ko tim thay post " });
    }

    // tao comment
    const newComment = {
      id: uuidv4(),
      postId,
      userId,
      content,
      createdAt: new Date(),
    };
    const response = await fetch(`http://localhost:3000/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComment),
    });

    const createdComment = await response.json();
    res
      .status(201)
      .json({ message: "comment tao thanh cong", comment: createdComment });
  } catch (error) {
    res.status(500).json({ error: "ko the tao comment moi" });
  }
});

// bai6
app.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const commentsResponse = await fetch(
      `http://localhost:3000/comments?postId=${postId}`
    );
    const comments = await commentsResponse.json();
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ error: "ko the tao comment moi" });
  }
});

// bai8

app.get("posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    // kt post
    const postRespone = await fetch(
      `http://localhost:3000/posts?postId=${postId}`
    );
    const post = await postRespone.json();
    if (post.length === 0) {
      return res.status(404).json({ error: "ko tim thay post" });
    }
    // lay tat ca comment cua post day
    const commentsResponse = await fetch(
      `http://localhost:3000/comments?postId=${postId}`
    );
    const comments = commentsResponse.json();
    res.status(200).json({ post: post[0], comments });
  } catch (error) {
    res.status(500).json({ error: "ko lay dc comment cua post" });
  }
});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
