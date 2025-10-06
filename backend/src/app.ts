import express, { type Request, type Response } from "express";
import config from "./libs/env.js";

const app = express();
const PORT = config.getNumber("PORT", 3000);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.NODE_ENV || "development"}`);
});
