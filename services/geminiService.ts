import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";

// Initialize the client
// API key must be obtained exclusively from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Sen MotoVibe adında bir motosiklet aksesuar mağazasının uzman yapay zeka satış danışmanısın.
Amacın, kullanıcıların sürüş tarzına, bütçesine ve ihtiyaçlarına göre mağazamızdaki en uygun ürünleri önermektir.

Aşağıdaki ürün listesine tam erişimin var. Lütfen sadece bu listedeki ürünleri öner, ancak genel motosiklet tavsiyesi de verebilirsin.
Ürün önerirken ürünün adını ve neden o kullanıcı için uygun olduğunu belirt.

ÜRÜN LİSTESİ:
${JSON.stringify(PRODUCTS.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, features: p.features })))}

Kurallar:
1. Çok nazik, "kardeşim", "dostum" gibi samimi ama saygılı bir motorcu dili kullanabilirsin.
2. Kısa ve öz cevaplar ver.
3. Kullanıcı "Merhaba" derse, ona nasıl yardımcı olabileceğini sor (Örn: Hangi motoru sürüyorsun? Hava durumu nasıl? vb.)
4. Sadece Türkçe konuş.
5. Ürün önerdiğinde fiyatını da belirt.
`;

export const sendMessageToGemini = async (message: string, history: { role: 'user' | 'model'; text: string }[] = []): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Anahtarı eksik. Lütfen geliştirici ile iletişime geçin.";
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Üzgünüm, şu an bağlantımda bir sorun var. Birazdan tekrar dener misin dostum?";
  }
};