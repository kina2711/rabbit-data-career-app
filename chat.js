export default async function handler(req, res) {
  // Chỉ chấp nhận method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  
  // Lấy API Key từ biến môi trường của Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Config Error: Missing GEMINI_API_KEY' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: message }] }]
    };

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        throw new Error(`Gemini API Error: ${errText}`);
    }

    const data = await apiResponse.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể trả lời lúc này.";

    // Trả về kết quả cho Frontend
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Backend Error:', error);
    return res.status(500).json({ error: 'Internal Server Error fetching AI response.' });
  }
}
