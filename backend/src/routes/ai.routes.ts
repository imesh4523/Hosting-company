import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: 'AIzaSyAuaHqiokFjoFC3gB15_QU9h-v4bSGrfqI' });

router.post('/', async (req, res) => {
  // Extract parameters sent by frontend
  // first=send-ai-message
  const first = req.query.first;
  
  if (first === 'send-ai-message') {
    try {
      const text = req.body.text || '';
      if (!text) {
        return res.json({ status: 400, message: 'No text provided' });
      }

      // Call Gemini API
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
      });

      const reply = response.text || 'I could not generate a response.';

      // Construct the HTML to return
      const html = `
        <div class="d-flex w-100 flex-column justify-content-start gap-2 mb-4 mb-lg-5">
          <div class="d-flex align-items-center gap-3">
            <div class="flex-0 text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <h4 class="mb-0">UltaAI</h4>
          </div>
          <div class="Markdown-txt text-dark ps-5">
            <p>${reply.replace(/\\n/g, '<br>')}</p>
          </div>
        </div>
      `;

      return res.json({
        status: 200,
        html: html
      });
    } catch (error: any) {
      console.error('AI Error:', error);
      return res.json({
        status: 500,
        html: `<div class="text-danger">Sorry, I encountered an error: ${error.message}</div>`
      });
    }
  } else if (first === 'reset-ai-chat') {
      return res.json({ status: 200, html: '' });
  } else if (first === 'get-ai-chat') {
      return res.json({ status: 200, html: '' });
  }

  // Fallback for other xhr.php endpoints
  return res.json({ status: 200, html: '' });
});

export default router;
