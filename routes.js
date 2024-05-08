const { User } = require("./Connection");
const bcrypt = require("bcrypt");

const multer = require("multer");
const ImageModel = require("./Connection");

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    let filename = file.originalname;
    cb(null, filename);
  },
});
const upload = multer({ storage }).single("test");

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  // Initialize Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "Rinshu330@gmail.com",
      pass: "your_password",
    },
  });

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  // Create new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });
  await newUser.save();
  res.status(201).json({ message: "User created successfully" });
};
// Login route
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid password" });
  }
  // Here you can generate and return a JWT token for authentication
  res.status(200).json({ message: "Login successful" });
};

// Forgot password route
const fpassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  // Generate a new password
  const newPassword = Math.random().toString(36).slice(-8);
  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  // Update user's password in the database
  await User.updateOne({ email }, { password: hashedPassword });
  // Send the new password to user's email
  const mailOptions = {
    from: "your_email@gmail.com",
    to: email,
    subject: "New Password",
    text: `Your new password is: ${newPassword}`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Failed to send email" });
    }
    console.log("Email sent: " + info.response);
    res.status(200).json({ message: "New password sent to your email" });
  });
};

//Post Route
const postImage = async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({ message: err.message });
    } else {
      const newImage = new ImageModel({
        name: req.body.name,
        image: {
          data: req.file.filename,
          contentType: "image/png",
        },
      });
      newImage
        .save()
        .then(() => res.send("Successfully uploaded"))
        .catch((err) => console.log(err));
    }
  });
};

//Get Post Route
const getpost = async (req, res) => {
  const post = await ImageModel.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.status(200).json(post);
};

// Updatepost Route
const updatedPost = async (req, res) => {
  const { content } = req.body;
  const updatedPost = await ImageModel.findByIdAndUpdate(
    req.params.postId,
    { content },
    { new: true }
  );
  if (!updatedPost) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.status(200).json({ message: "Post updated successfully" });
};

const deletepost = async (req, res) => {
  const deletedPost = await ImageModel.findByIdAndDelete(req.params.postId);
  if (!deletedPost) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.status(200).json({ message: "Post deleted successfully" });
};

//Like Post Route
const likepost = async (req, res) => {
  const updatedPost = await ImageModel.findByIdAndUpdate(
    req.params.postId,
    { $inc: { likes: 1 } },
    { new: true }
  );
  if (!updatedPost) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.status(200).json({ message: "Post liked successfully" });
};

// add Comment Route
const addcomment = async (req, res) => {
  const { userId, text } = req.body;
  const updatedPost = await ImageModel.findByIdAndUpdate(
    req.params.postId,
    { $push: { comments: { userId, text } } },
    { new: true }
  );
  if (!updatedPost) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.status(200).json({ message: "Comment added successfully" });
};

module.exports = {
  signup,
  login,
  fpassword,
  getpost,
  updatedPost,
  deletepost,
  likepost,
  addcomment,
  postImage,
};
