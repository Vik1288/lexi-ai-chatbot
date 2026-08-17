import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: "Invalid messages"
            });
        }

        const response = await client.responses.create({
            model: "gpt-5-mini",
            instructions:
                "You are Nova AI, a helpful and friendly AI assistant. Answer clearly and professionally. If the user speaks Hinglish, reply in Hinglish.",
            input: messages
        });

        res.json({
            reply: response.output_text
        });

    } catch (error) {

        console.error("OpenAI Error:", error);

        res.status(500).json({
            error: "AI response generate nahi ho paya."
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Nova AI running at http://localhost:${PORT}`);
});