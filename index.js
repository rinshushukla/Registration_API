// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const {
  signup,
  login,
  fpassword,
  getpost,
  updatedPost,
  deletepost,
  likepost,
  addcomment,
  postImage,
} = require("./routes");

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// Signup route
app.post("/signup", signup);

// Login route
app.post("/login", login);

// Forgot password route
app.post("/forgotpassword", fpassword);

//Upload Image Route
app.post("/postimage", postImage);

app.get("/post/:postId", getpost);

app.put("/post/:postId", updatedPost);

app.delete("/post/:postId", deletepost);

app.put("/post/:postId/like", likepost);

app.post("/post/:postId/comment", addcomment);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
