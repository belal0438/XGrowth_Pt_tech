require("dotenv").config({ path: "./.env" });

const sequelize = require("./db/database");

const app = require("./app");

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error Event For App !!", error);
    });
    console.log("Sequelise connected!");
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running at Port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("sequallize connection failed!!", err);
    process.exit(1);
  });
