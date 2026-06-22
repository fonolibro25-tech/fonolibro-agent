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
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
body{font-family:Arial,sans-serif;margin:0;background:#fff;}
#messages{height:360px;overflow-y:auto;padding:12px;font-size:14px;}
.msg{padding:10px;border-radius:10px;margin-bottom:10px;max-width:85%;white-space:pre-wrap;}
.bot{background:#f1f1f1;color:#333;}
.user{background:#e85df5;color:white;margin-left:auto;}
.quick{padding:8px;display:flex;gap:5px;flex-wrap:wrap;}
.quick button{border:none;background:#f3d7f8;padding:7px;border-radius:8px;cursor:pointer;}
.input{display:flex;border-top:1px solid #ddd;}
input{flex:1;border:none;padding:12px;outline:none;}
button.send{background:#e85df5;color:white;border:none;padding:12px;cursor:pointer;}
</style>
</head>
<body>
<div id="messages">
  <div class="msg bot">¡Hola! Soy el asistente de Fonolibro. ¿Qué tipo de audiolibro te gustaría escuchar hoy?</div>
</div>

<div class="quick">
  <button onclick="quick('Quiero desarrollo personal')">Desarrollo personal</button>
  <button onclick="quick('Busco metafísica')">Metafísica</button>
  <button onclick="quick('Explícame la suscripción')">Suscripción</button>
</div>

<div class="input">
  <input id="input" placeholder="Escribe tu pregunta...">
  <button class="send" onclick="send()">Enviar</button>
</div>

<script>
function add(text, type){
  const box=document.getElementById('messages');
  const div=document.createElement('div');
  div.className='msg '+type;
  div.textContent=text;
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
  return div;
}

function quick(text){
  document.getElementById('input').value=text;
  send();
}

document.getElementById('input').addEventListener('keypress',function(e){
  if(e.key==='Enter') send();
});

async function send(){
  const input=document.getElementById('input');
  const message=input.value.trim();
  if(!message) return;

  add(message,'user');
  input.value='';

  const typing=add('Escribiendo...','bot');

  try{
    const res=await fetch('/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message})
    });

    const data=await res.json();
    typing.remove();
    add(data.reply || 'No pude responder en este momento.','bot');
  }catch(e){
    typing.remove();
    add('Hubo un error conectando con el asistente. Intenta nuevamente.','bot');
  }
}
</script>
</body>
</html>
  `);
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
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
  console.log("Fonolibro Agent running on port " + PORT);
});
