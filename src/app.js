const express = require("express");
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

const User = require("./models/user.models");
const UserInformation = require("./models/userInfo.models");
const userRoute = require("./routes/users.route");

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16Kb" }));

app.use("/api/v1/users", userRoute);

User.hasOne(UserInformation);
UserInformation.belongsTo(User);

module.exports = app;
