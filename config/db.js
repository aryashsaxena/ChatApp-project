const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectToMongo = () => {
  mongoose.set("strictQuery", false);

  mongoose
    .connect(process.env.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(`Welcome to MongoDB!! ${mongoose.connection.host}`);
    })
    .catch((err) => {
      console.log(err);
      process.exit();
    });
};

module.exports = connectToMongo;
