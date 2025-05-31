const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Cria a pasta "fichas" se não existir
const pastaFichas = path.join(__dirname, 'fichas');
if (!fs.existsSync(pastaFichas)) {
  fs.mkdirSync(pastaFichas);
}

// Rota para salvar uma ficha
app.post('/salvar-ficha', (req, res) => {
  const ficha = req.body;
  const id = uuidv4();
  const caminho = path.join(pastaFichas, `${id}.json`);

  fs.writeFile(caminho, JSON.stringify(ficha, null, 2), err => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao salvar a ficha' });
    }
    res.json({ id });
  });
});

// Rota para carregar uma ficha
app.get('/ficha/:id', (req, res) => {
  const id = req.params.id;
  const caminho = path.join(pastaFichas, `${id}.json`);

  if (!fs.existsSync(caminho)) {
    return res.status(404).json({ erro: 'Ficha não encontrada' });
  }

  const ficha = fs.readFileSync(caminho);
  res.json(JSON.parse(ficha));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Conectado ao MongoDB Atlas");
}).catch(err => {
  console.error("❌ Erro ao conectar ao MongoDB:", err);
});
