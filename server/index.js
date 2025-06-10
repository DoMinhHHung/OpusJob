const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const { connectDB } = require("./utils/db.js");
dotenv.config();

port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptin = {
  origin: ["*"],
  credentials: true,
};
app.use(cors(corsOptin));

app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
