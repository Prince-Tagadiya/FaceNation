
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Checking specific model access...");
    // We can't easily "check" without generating, but let's try to list
    // The SDK doesn't always expose listModels directly in the high level helper, 
    // but we can try a basic generation to see if ANY works.
    
    // Actually, let's try to generate with a known stable model name to verify the KEY works at all.
    const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await modelPro.generateContent("Hello via Node");
    console.log("gemini-pro works:", result.response.text());

    console.log("Now trying gemini-1.5-flash...");
    const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const resultFlash = await modelFlash.generateContent("Hello via Flash");
    console.log("gemini-1.5-flash works:", resultFlash.response.text());

  } catch (err) {
    console.error("Error:", err.message);
  }
}

listModels();
