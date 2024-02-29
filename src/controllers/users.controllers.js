const fs = require("fs");
const { Op } = require("sequelize");
const sequelize = require("../db/database");
const User = require("../models/user.models");
const UserInformation = require("../models/userInfo.models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { use } = require("../app");
const { error } = require("console");

const getDataAndInsertIntoDataBsae = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const data = fs.readFileSync("dummyData.json", "utf8");
    const jsonData = JSON.parse(data);
    if (jsonData.length < 1) {
      await t.rollback();
      return res
        .status(201)
        .json(new ApiResponse(200, [], " JSON file does not have data."));
    }
    for (const user of jsonData) {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username: user.username }, { email: user.email }],
        },
      });
      if (!existingUser) {
        const createdUser = await User.create({
          username: user.username,
          email: user.email,
        });
        await UserInformation.create({
          UserId: createdUser.id,
          first_name: user.user_information.first_name,
          last_name: user.user_information.last_name,
          age: user.user_information.age,
          gender: user.user_information.gender,
          address: user.user_information.address,
        });
      }
    }
    const dataFromDatabase = await User.findAll({
      attributes: ["id", "username", "email"],
      include: {
        model: UserInformation,
        attributes: ["first_name", "last_name", "age", "gender", "address"],
      },
    });
    // console.log("Data from Database:", dataFromDatabase);

    const transformedData = dataFromDatabase.map((user) => {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        user_information: {
          first_name: user.UserInformation.first_name,
          last_name: user.UserInformation.last_name,
          age: user.UserInformation.age,
          gender: user.UserInformation.gender,
          address: user.UserInformation.address,
        },
      };
    });
    // console.log("transformedData:", transformedData);
    await t.commit();
    return res
      .status(201)
      .json(new ApiResponse(200, transformedData, " All JSON file data."));
  } catch (errors) {
    await t.rollback();
    return res.status(error.statusCode || 500).json({
      success: false,
      statusCode: error.statusCode || 500,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const postdataforAparticularUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, "email is required");
    }
    const existingUser = await User.findOne({
      where: { email },
      attributes: ["id", "username", "email"],
      include: [
        {
          model: UserInformation,
          attributes: ["first_name", "last_name", "age", "gender", "address"],
        },
      ],
    });

    if (!existingUser) {
      throw new ApiError(404, "User does not exist");
    }
    // console.log("existUser", existingUser);
    const userData = {
      id: existingUser.dataValues.id,
      username: existingUser.dataValues.username,
      email: existingUser.dataValues.email,
      userInformation: {
        first_name: existingUser.UserInformation.dataValues.first_name,
        last_name: existingUser.UserInformation.dataValues.last_name,
        age: existingUser.UserInformation.dataValues.age,
        gender: existingUser.UserInformation.dataValues.gender,
        address: existingUser.UserInformation.dataValues.address,
      },
    };
    // console.log("userData", userData);
    return res.status(201).json(new ApiResponse(200, userData, "user data."));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      statusCode: error.statusCode || 500,
      message: error.message || "Something went wrong",
      errors: error.errors || [],
    });
  }
};

module.exports = { getDataAndInsertIntoDataBsae, postdataforAparticularUser };
