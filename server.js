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


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conexão MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Conectado ao MongoDB");
}).catch(err => {
  console.error("❌ Erro ao conectar:", err);
});

// Modelo de ficha
const fichaSchema = new mongoose.Schema({
  idPublico: String, // Ex: ficha-1
  nomePersonagem: String,
  nomeJogador: String,
  titulo: String,
  cartaAstucia: String,
  cartaOrigem: String,
  dons: Object,
  status: Object,
  inventario: Array,
  habilidades: Array,
  invocacoes: {
    arcanas: Array,
    divinas: Array
  }
});

const Ficha = mongoose.model('Ficha', fichaSchema);

// POST: Salvar ficha
app.post('/salvar-ficha', async (req, res) => {
  try {
    const idPublico = 'ficha-' + nanoid(6); // ex: ficha-3xysdf
    const ficha = new Ficha({ ...req.body, idPublico });
    await ficha.save();
    res.json({ url: `https://mortandade-ficha.onrender.com/${idPublico}` });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar ficha', detalhes: err });
  }
});

// GET: Retorna JSON da ficha por ID público
app.get('/api/:idPublico', async (req, res) => {
  try {
    const ficha = await Ficha.findOne({ idPublico: req.params.idPublico });
    if (!ficha) return res.status(404).json({ erro: 'Ficha não encontrada' });
    res.json(ficha);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar ficha', detalhes: err });
  }
});

// GET: Página de exibição visual da ficha
app.get('/:idPublico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ficha.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

