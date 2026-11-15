
<script>
const falasCoruja = [
  "Opa! Chegou visita? Podem entrar, mas cuidado com a minha beleza!",
  "Só para avisar: a criatura mais bonita deste castelo sou eu!",
  "O mago acha que manda aqui. Que gracinha!",
  "Alguém trouxe um espelho? Preciso conferir se continuo maravilhosa!",
  "Ei, visitantes! Olhem para mim também! Não sou decoração!",
  "Eu sou uma coruja muito inteligente. E modesta também... mais ou menos!",
  "Psiu! Não contem ao mago, mas eu sou a estrela deste castelo!",
  "Que lugar maravilhoso! Principalmente porque eu estou nele!"
];

let corujaAtiva = false;
let ultimaFala = -1;

function falarCoruja() {
  if (!corujaAtiva || speechSynthesis.speaking) return;

  let indice;
  do {
    indice = Math.floor(Math.random() * falasCoruja.length);
  } while (indice === ultimaFala);

  ultimaFala = indice;

  const fala = new SpeechSynthesisUtterance(falasCoruja[indice]);
  fala.lang = "pt-BR";
  fala.rate = 1.08;
  fala.pitch = 1.35;

  speechSynthesis.speak(fala);
}

const botaoCoruja = document.createElement("button");
botaoCoruja.textContent = "🦉 Acordar coruja";
botaoCoruja.style.cssText =
  "position:fixed;bottom:18px;right:18px;z-index:99999;padding:12px 16px;border-radius:25px;border:1px solid gold;background:#211708;color:white;font-size:14px;";

botaoCoruja.onclick = () => {
  corujaAtiva = !corujaAtiva;
  botaoCoruja.textContent = corujaAtiva
    ? "🦉 Coruja acordada"
    : "🦉 Acordar coruja";

  if (corujaAtiva) falarCoruja();
  else speechSynthesis.cancel();
};

document.body.appendChild(botaoCoruja);

setInterval(falarCoruja, 30000);
</script>
