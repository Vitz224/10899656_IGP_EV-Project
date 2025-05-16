const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("Gemini API Key:", process.env.GEMINI_API_KEY);

exports.askGemini = async (req, res) => {
  const { message } = req.body;
  console.log("Received message:", message);
  console.log("Gemini API Key:", process.env.GEMINI_API_KEY ? "Exists" : "Missing");
  console.log("Requesting Gemini with message:", message);

  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: message }] }] }
    );
    const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
    res.json({ text: aiText });
  } catch (err) {
    console.error("Gemini error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
};
