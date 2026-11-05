
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Esfera IA funcionando com Gemini!");
});

app.post("/chat", async (req, res) => {
  try {
    const pergunta = req.body.message;

    if (!pergunta) {
      return res.status(400).json({
        reply: "Por favor, faça uma pergunta!"
      });
    }

    const chave = process.env.GEMINI_API_KEY;

    if (!chave) {
      throw new Error("GEMINI_API_KEY não encontrada no Render.");
    }

    const resposta = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": chave
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "Você é a Esfera IA, uma inteligência artificial educativa da Feira de Ciências 2026 da escola EEJMC. Fale sempre em português brasileiro. Seja simpática, inteligente, criativa e educativa. Responda de maneira clara e objetiva. Ajude crianças e estudantes a aprender ciência."
            }]
          },
          contents: [{
            role: "user",
            parts: [{
              text: pergunta
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250
          }
        })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error("Erro Gemini:", dados);

      return res.status(resposta.status).json({
        reply: "O Gemini está temporariamente indisponível. Tente novamente daqui a pouco."
      });
    }

    const texto = dados.candidates?.[0]?.content?.parts
      ?.map(parte => parte.text || "")
      .join("");

    if (!texto) {
      throw new Error("O Gemini não retornou uma resposta.");
    }

    console.log("Resposta do Gemini recebida!");

    res.json({
      reply: texto
    });

  } catch (erro) {
    console.error("Erro na Esfera IA:", erro.message);

    res.status(500).json({
      reply: "Tive um probleminha para me conectar. Por favor, tente novamente."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Esfera IA iniciada com Gemini!");
});
