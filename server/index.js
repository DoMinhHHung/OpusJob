const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const { connectDB } = require("./utils/db.js");
const userRoutes = require("./routes/User.js");
const companyRoutes = require("./routes/Company.js");
const jobRoutes = require("./routes/Job.js");
const applicationRoutes = require("./routes/Application.js");
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

app.use("/api/user", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoutes);

app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
