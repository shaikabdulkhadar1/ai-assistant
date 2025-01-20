import express from "express";
import cors from "cors";
import morgan from "morgan";
import connect from "./db/db.js";
import "dotenv/config.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import cookieParser from "cookie-parser";

const app = express();

connect();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/users", userRoutes);
app.use("/projects", projectRoutes);

export default app;
