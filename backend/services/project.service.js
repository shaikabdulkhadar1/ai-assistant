import projectModel from "../models/project.model.js";
import mongoose from "mongoose";

export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Project name is required");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  const project = await projectModel.create({
    name,
    users: [userId],
  });

  return project;
};

export const getAllProjectsByUserId = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  console.log(userId);
  const allUserProjects = await projectModel.find({ users: userId });

  return allUserProjects;
};

export const addUsersToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!users) {
    throw new Error("Users are required");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Project ID is invalid");
  }
  if (
    !Array.isArray(users) ||
    users.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new Error("Users must be an array");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("User ID is invalid");
  }

  const project = await projectModel.findOne({ _id: projectId, users: userId });
  if (!project) {
    throw new Error("User does not belong to this project");
  }

  const updatedProject = await projectModel.findOneAndUpdate(
    { _id: projectId },
    {
      $addToSet: { users: { $each: users } },
    },
    {
      new: true,
    }
  );

  return updatedProject;
};

export const getProjectById = async (projectId) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Project ID is invalid");
  }

  const project = await projectModel
    .findOne({ _id: projectId })
    .populate("users");

  return project;
};
