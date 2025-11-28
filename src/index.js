import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { env } from "./lib/env.js";
import subscriptionRouter from "./routes/subscription.js";
import replyRouter from "./routes/reply.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/subscription", subscriptionRouter);
app.use("/reply", replyRouter);

const PORT = Number(env("PORT", "4000"));
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
