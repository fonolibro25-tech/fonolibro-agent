import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Eres el Asistente Oficial de Fonolibro.

Fonolibro es una plataforma de audiolibros en español con más de 5000 títulos.

Tu misión es:
- Recomendar audiolibros.
- Explicar la suscripción.
- Ayudar a descubrir nuevos títulos.
- Responder siempre en español.
- Ser amable, profesional y breve.

Audiolibros destacados:
- Controla y Empodera tu Mente
- Piense y Hágase Rico
- Dueño Imparable
- Meditaciones Diarias
- Doña Bárbara

Suscripción:
- Escucha ilimitada.
- USD 5.99 al mes.
`;

app.get("/", (req, res) => {
  res.json({
    status: "Fonolibro Agent Online"
  });
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error procesando la solicitud."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Fonolibro Agent running on port ${PORT}`);
});
