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
        reply: "Não recebi sua pergunta."
      });
    }

    const chave = process.env.GEMINI_API_KEY;

    if (!chave) {
      throw new Error("Chave GEMINI_API_KEY não encontrada.");
    }

    const resposta = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": chave
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "Você é a Esfera IA, uma inteligência artificial educativa da Feira de Ciências 2026 da escola EEJMC. Fale sempre em português brasileiro, com simpatia, clareza e respostas objetivas. Ajude crianças e estudantes a aprender ciência."
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: pergunta }]
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
      throw new Error(
        dados.error?.message || "Erro ao consultar o Gemini."
      );
    }

    const texto = dados.candidates?.[0]?.content?.parts
      ?.map(parte => parte.text || "")
      .join("");

    res.json({
      reply: texto || "Não consegui gerar uma resposta."
    });

  } catch (erro) {
    console.error("Erro:", erro.message);

    res.status(500).json({
      reply: "Tive um probleminha. Tente novamente!"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Esfera IA iniciada com Gemini!");
});
