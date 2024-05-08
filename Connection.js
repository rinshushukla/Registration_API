const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/loginDB", {});
const User = mongoose.model("User", {
  username: String,
  email: String,
  password: String,
});

const ImageSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  likes: { type: Number, default: 0 },
  comments: [{ userId: String, text: String }],
});

module.exports = { User };
module.exports = ImageModel = mongoose.model("imageModel", ImageSchema);
