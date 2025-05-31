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

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Conectado ao MongoDB Atlas");
}).catch(err => {
  console.error("❌ Erro ao conectar ao MongoDB:", err);
});

// Schema do Mongoose
const fichaSchema = new mongoose.Schema({
  idPublico: String,
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

// POST para salvar ficha
app.post('/salvar-ficha', async (req, res) => {
  try {
    const idPublico = 'ficha-' + nanoid(6);
    const ficha = new Ficha({ ...req.body, idPublico });
    await ficha.save();
    res.json({ url: `https://mortandade-ficha.onrender.com/${idPublico}` });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar ficha', detalhes: err });
  }
});

// GET para carregar ficha por ID público (JSON)
app.get('/api/:idPublico', async (req, res) => {
  try {
    const ficha = await Ficha.findOne({ idPublico: req.params.idPublico });
    if (!ficha) return res.status(404).json({ erro: 'Ficha não encontrada' });
    res.json(ficha);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar ficha', detalhes: err });
  }
});

// Página visual da ficha
app.get('/:idPublico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ficha.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
