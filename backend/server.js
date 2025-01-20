import http from "http";
import app from "./app.js";
import "dotenv/config.js";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";

const port = process.env.PORT;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];
    const projectId = socket.handshake.query.projectId;

    if (!token) {
      return next(new Error("Authentication error"));
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("ProjectId is invalid"));
    }

    socket.project = await projectModel.findById(projectId);

    const decoded = jwt.verify(token, process.env.SECRET);
    if (!decoded) {
      return next(new Error("invalid token2"));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();

  console.log("a user connected");
  socket.join(socket.roomId);

  socket.on("project-message", (data) => {
    console.log(data);
    socket.broadcast.to(socket.roomId).emit("project-message", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
