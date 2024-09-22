import express from "express";
// import users from './data.js'
import data from "./data2.js";
import { v4 as uuidv4 } from "uuid";
const { users, posts } = data;
const app = express();
app.use(express.json());
app.listen(8080, () => {
  console.log("server is running");
});

app.get("/users", (req, res) => {
  res.end(JSON.stringify(users));
});

// app.get("/users/add-random", (req, res) => {
//   res.end(JSON.stringify(posts));
// });

// app.put("users/update-user", (req, res) => {
//   console.log(req);
// });

// app.delete("users/update-user", (req, res) => {
//   console.log(req);
// });

// bai tap 2
app.get("/", (req, res) => {
  res.send("HomePage");
});
// 1 Viết API lấy thông tin của user với id được truyền trên params.

app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  const user = users.find((item) => item.id == id);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "can not found user" });
  }
});

// 2 Viết API tạo user với các thông tin như trên users, với id là random (uuid), email là duy nhất, phải kiểm tra được trùng email khi tạo user.

app.post("/users", (req, res) => {
  const user = req.body;
  if (user) {
    const email = user.email;
    const checkMail = users.findIndex(
      (item) => item.email === email || item.id === user.id
    );
    if (checkMail !== -1) {
      res.json({ message: "user exist" });
    } else {
      users.push(user);
      res.status(200).json({ message: "created successfully" });
    }
  } else {
    res.status(501).json({ message: "params is not valid" });
  }
});
// 3 Viết API lấy ra các bài post của user được truyền userId trên params.

app.get("/users/:userId/posts", (req, res) => {
  const { userId } = req.params;
  const UserPost = posts.filter((post) => post.userId === userId);
  if (UserPost.length > 0) {
    res.status(200).json({
      posts: UserPost,
      total: UserPost.length,
    });
  } else {
    res.status(404).json({ message: "post not found" });
  }
});
// 4 Viết API thực hiện tạo bài post với id của user được truyền trên params.
app.post("/users/:userId/createPost", (req, res) => {
  const { userId } = req.params;
  const body = req.body || {};

  const user = users.find((item) => item.id === userId);
  if (user) {
    const post = {
      ...body,
      userId,
      postId: uuidv4(),
      createdAt: new Date(),
    };
    posts.push(post);
    res.status(200).json({ message: "create post successfully!!!" });
  } else {
    res.status(404).json({ message: "not found one" });
  }
});

// 5 Viết API cập nhật thông tin bài post với postId được truyền trên params, chỉ có user tạo bài mới được phép.
app.put("/posts/:postId", (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  const postIndex = posts.findIndex((post) => post.postId === postId);
  if (postIndex !== -1) {
    res.status(404).status("post not found");
  }
  const post = posts[postIndex];
  if (!post.userId === userId) {
    res
      .status(403)
      .json({ message: "you are not the user who create this post!!!" });
  }
});

// 200 ok
// 400:bad req
// 404: not found
// 401 : unauthorized
// 500 internal server error

// query lay du lieu tu : &
// param lay du lieu sau dau :

// lesson3

// goi giua 2 con server voi nhau
// con sever nay la xu li yeu cau ng dung
// con server json server xu li luu tru
app.get("/users2/json-server", (req, res) => {
  fetch("http://localhost:3000/users")
    .then((res) => res.json())
    .then((data) => {
      res.status(200).send(data);
    });
});

// thu vien concurrently --save dev cho tra chay 2 server dong thoi

app.post("/users2/json-server/create", (req, res) => {
  // const { username } = req.body
  // if (username) {
  //   res.status(400).send('not  ok')
  // }
  const data = {
    email: "test@example.com",
  };
  fetch("http://localhost:3000/users", {
    method: "POST",
    contentType: "application/json",
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      res.status(200).send(data);
    });
});

// async await xu li bat dong bo
app.post("/users2/json-server/async/create", async (req, res) => {
  try {
    const respone = await fetch("http://localhost:3000/users", {
      method: "POST",
      'content-type': "application/json",
      body: JSON.stringify(data),
    });
    const data = await respone.json();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send("he thong cap nhat du lieu");
  }
});
