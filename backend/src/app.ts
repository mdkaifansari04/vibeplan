import express, { type Request, type Response } from "express";
import config, { getString, getNumber } from "./libs/env";

const app = express();
const PORT = getNumber("PORT", 3000);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.NODE_ENV || "development"}`);
});
