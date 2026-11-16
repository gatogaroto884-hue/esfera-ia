
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// Página principal da Esfera IA
app.get("/", (req, res) => {
  const arquivoHTML = path.join(
    process.cwd(),
    "sintonia_ia_completo-3.html"
  );

  if (!fs.existsSync(arquivoHTML)) {
    console.error("HTML não encontrado:", arquivoHTML);
    console.error("Arquivos disponíveis:", fs.readdirSync(process.cwd()));

    return res.status(404).send(
      "Arquivo HTML não encontrado. Verifique o nome no GitHub."
    );
  }

  res.sendFile(arquivoHTML);
});

// Função de conexão com Gemini
async function consultarGemini(pergunta, personalidade) {
  const chave = process.env.GEMINI_API_KEY;

  if (!chave) {
    throw new Error("GEMINI_API_KEY não encontrada.");
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
          parts: [{ text: personalidade }]
        },
        contents: [{
          role: "user",
          parts: [{ text: pergunta }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 250
        }
      })
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    console.error("Erro Gemini:", dados);
    throw new Error("Falha na resposta do Gemini.");
  }

  const texto = dados.candidates?.[0]?.content?.parts
    ?.map(parte => parte.text || "")
    .join("");

  if (!texto) {
    throw new Error("Gemini não retornou uma resposta.");
  }

  return texto;
}

// Conversa com a Esfera IA
app.post("/chat", async (req, res) => {
  try {
    const pergunta = req.body.message;

    if (!pergunta) {
      return res.status(400).json({
        reply: "Por favor, faça uma pergunta!"
      });
    }

    const resposta = await consultarGemini(
      pergunta,
      "Você é a Esfera IA, uma inteligência artificial educativa da Feira de Ciências 2026 da escola EEJMC. Fale sempre em português brasileiro. Seja simpática, inteligente, criativa e educativa. Ajude crianças e estudantes a aprender ciência."
    );

    res.json({ reply: resposta });

  } catch (erro) {
    console.error("Erro na Esfera IA:", erro.message);
    res.status(500).json({
      reply: "Tive um probleminha para me conectar. Tente novamente."
    });
  }
});

// Conversa com a coruja
app.post("/coruja", async (req, res) => {
  try {
    const pergunta = req.body.message;

    if (!pergunta) {
      return res.status(400).json({
        reply: "Ei! Você esqueceu de falar comigo!"
      });
    }

    const resposta = await consultarGemini(
      pergunta,
      "Você é uma coruja falante de um castelo mágico. É engraçada, espontânea, tagarela, exibida e convencida de que é a criatura mais bonita do castelo. Adora conversar com visitantes, fazer brincadeiras e provocar o mago de forma divertida. Fale sempre em português brasileiro, com respostas naturais, curtas e divertidas. Você é independente da Esfera IA."
    );

    res.json({ reply: resposta });

  } catch (erro) {
    console.error("Erro na coruja:", erro.message);
    res.status(500).json({
      reply: "Ai, minhas penas! Não consegui pensar agora!"
    });
  }
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Esfera IA iniciada com Gemini!");
});
