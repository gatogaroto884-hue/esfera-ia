const express = require(“express”);
const cors = require(“cors”);
const path = require(“path”);
const fs = require(“fs”);

const app = express();

app.use(cors());
app.use(express.json());

app.get(”/”, (req, res) => {
const arquivoHTML = path.join(
process.cwd(),
“esfera_ia_completo-3.html”
);

if (!fs.existsSync(arquivoHTML)) {
return res.status(404).send(“Arquivo HTML não encontrado.”);
}

res.sendFile(arquivoHTML);
});

async function consultarGemini(pergunta, personalidade) {
const chave = process.env.GEMINI_API_KEY;

if (!chave) {
throw new Error(“GEMINI_API_KEY não encontrada.”);
}

const resposta = await fetch(
“https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent”,
{
method: “POST”,
headers: {
“Content-Type”: “application/json”,
“x-goog-api-key”: chave
},
body: JSON.stringify({
systemInstruction: {
parts: [{ text: personalidade }]
},
contents: [{
role: “user”,
parts: [{ text: pergunta }]
}],
generationConfig: {
temperature: 0.8,
maxOutputTokens: 300
}
})
}
);

const dados = await resposta.json();

if (!resposta.ok) {
console.error(“Erro Gemini:”, dados);
throw new Error(“Falha na resposta do Gemini.”);
}

const texto = dados.candidates?.[0]?.content?.parts
?.map(parte => parte.text || “”)
.join(””);

if (!texto) {
throw new Error(“Gemini não retornou uma resposta.”);
}

return texto;
}

// PERSONALIDADE DO MAGO AI
app.post(”/chat”, async (req, res) => {
try {
const pergunta = req.body.message;

if (!pergunta) {
  return res.status(400).json({
    reply: "Qual é sua pergunta, jovem viajante?"
  });
}
const personalidade = `

Você é o MAGO AI, uma inteligência artificial mágica criada pelo
mago de um castelo encantado.

Sua missão principal é responder perguntas e ensinar conhecimentos,
especialmente para estudantes e visitantes de uma feira de ciências.

Fale sempre em português brasileiro.

Sua personalidade é misteriosa, inteligente, simpática, educativa
e levemente divertida. Você fala como uma inteligência artificial
mágica, mas suas explicações devem ser claras e corretas.

Você pode ensinar:

* Ciências e fenômenos da natureza.
* Matemática.
* História e Geografia.
* Tecnologia e inteligência artificial.
* Curiosidades e conhecimentos gerais.
* Outros assuntos escolares.

Explique assuntos difíceis de maneira simples e com exemplos.

Não invente informações quando não souber a resposta.
Não diga que realizou experiências físicas que não realizou.
Não fique falando de magia em todas as respostas.
A magia faz parte da sua personalidade, mas sua função principal
é ensinar e responder perguntas.

Quando alguém perguntar seu nome, responda:
“Sou o MAGO AI, a inteligência artificial mágica deste castelo!”

Dê respostas naturais, interessantes e adequadas a estudantes.
`;

const resposta = await consultarGemini(pergunta, personalidade);
res.json({ reply: resposta });

} catch (erro) {
console.error(“Erro no MAGO AI:”, erro.message);

res.status(500).json({
  reply: "As energias do castelo oscilaram! Tente novamente."
});

}
});

// PERSONALIDADE DA CORUJA
app.post(”/coruja”, async (req, res) => {
try {
const pergunta = req.body.pergunta || req.body.message;

if (!pergunta) {
  return res.status(400).json({
    resposta: "Esqueceste de falar comigo, viajante!",
    reply: "Esqueceste de falar comigo, viajante!"
  });
}
const personalidade = `

Você é a coruja falante do castelo do MAGO AI.

Você é engraçada, inteligente, curiosa, espontânea e um pouquinho
convencida. Adora conversar com os visitantes e fazer brincadeiras.

Você também pode responder perguntas educativas e curiosidades.

Fale sempre em português brasileiro.
Use respostas naturais, curtas e divertidas.
Não invente informações.
Você é uma personagem independente do MAGO AI.

Você adora dizer que é a criatura mais sábia e elegante do castelo.
`;

const resposta = await consultarGemini(pergunta, personalidade);
res.json({
  resposta,
  reply: resposta
});

} catch (erro) {
console.error(“Erro na coruja:”, erro.message);

res.status(500).json({
  resposta: "Ai, minhas penas! Tive um probleminha!",
  reply: "Ai, minhas penas! Tive um probleminha!"
});

}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(“MAGO AI iniciado com Gemini!”);
});
