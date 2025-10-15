import express, { type Request, type Response } from "express";
import config, { getString, getNumber } from "./libs/env";
import router from "./api/v1/routes";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler";
const app = express();
const PORT = getNumber("PORT", 5000);
const ENV = getString("NODE_ENV", "development");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOption: cors.CorsOptions = {
  origin: ENV === "development" ? "http://localhost:3000" : ["https://www.vibeplan.codes", "https://vibeplan.codes"],
  optionsSuccessStatus: 200,
  methods: "GET,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsOption));
app.get("/health", (_: Request, res: Response) => {
  res.json({ status: "OK", timestamp: Date.now() });
});

app.use("/api/v1", router);
//global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
