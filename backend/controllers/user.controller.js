import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";

export const createUserController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await userService.createUser(req.body);
    const token = await user.generateJWT();
    delete user._doc.password;
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

export const loginUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      console.log(user);
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const isMatch = await user.isValidPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = await user.generateJWT();
    delete user._doc.password;
    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

export const profileUserController = async (req, res) => {
  console.log(req.user);
  res.status(200).send({ user: req.user });
};

export const logoutUserController = async (req, res) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization").split(" ")[1];
    await redisClient.set(token, "logout", "EX", 60 * 60 * 24);
    res.status(200).send({ message: "Logged out" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    const allUsers = await userService.getAllUsers({
      userId: loggedInUser._id,
    });
    return res.status(200).json({ users: allUsers });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
