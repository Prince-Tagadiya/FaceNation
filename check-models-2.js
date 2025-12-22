import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function check() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  try {
      const res = await model.generateContent("hi");
      console.log("gemini-2.0-flash-exp works", res.response.text());
  } catch(e) { console.log("gemini-2.0-flash-exp failed", e.message.slice(0, 100)); }

  const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
      const res = await model2.generateContent("hi");
      console.log("gemini-1.5-flash works", res.response.text());
  } catch(e) { console.log("gemini-1.5-flash failed", e.message.slice(0, 100)); }
}
check();
