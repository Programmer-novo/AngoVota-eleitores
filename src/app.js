// Importações necessárias
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const routes = require('./routes');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);

const app = express();
app.set('trust proxy', 1);

app.use((req, res, next)=>{
  req.pegarInformacoes = {
    ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'] || 'Desconhecido'
  };

  next();
});

// 🔹 Pool para sessões (pode usar a mesma connection string do Sequelize)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middleware necessários
app.use(cors({
  origin: process.env.CONEXAO,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Configurações da sessão
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.KeySession, 
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: true,       // exige HTTPS em produção
    httpOnly: true,     // protege contra XSS
    sameSite: 'none',   // necessário se front/back têm domínios diferentes
    maxAge: 1000 * 60 * 60 // 1 hora
  }
}));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, '../dist/Angular20/browser')));
app.use('/api', routes);

app.get((req, res)=>{
  res.sendFile(path.join(__dirname, '../dist/Angular20/browser/index.html'))
});


module.exports = app;



