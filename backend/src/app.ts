import express, { type Request, type Response } from "express";
import config, { getString, getNumber } from "./libs/env";
import router from "./api/v1/routes";

const app = express();
const PORT = getNumber("PORT", 5000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_: Request, res: Response) => {
  res.json({ status: "OK", timestamp: Date.now() });
});

app.use("/api/v1", router);

app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
