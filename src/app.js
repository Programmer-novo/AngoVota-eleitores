//Importações necessárias
const express = require('express');

require('dotenv').config();

const cors = require('cors');

const session = require('express-session');

const http = require('http');

const routes = require('./routes');

const { Server } = require('socket.io');

const app = express();



app.use((req, res, next)=>{
  req.pegarInformacoes = {
    ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'] || 'Desconhecido'
  };

  next();
});





//Middleware necessários
app.use(cors({
    origin: ['http://localhost:60452',
            'http://192.168.8.102:4200'

    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    //allowedHeaders: ['content-type', 'Authorization'],
    credentials: true
}));// conexão com o frontend
app.use(express.json()); //trata toda estrutura em json
app.use(express.urlencoded({ extended: true }))
// Configurações da sessão
app.use(session({
secret: process.env.KeySession, //Chave secreta
resave: false, // em false, não salva a sessão se não mudou
saveUninitialized: false, // em false, não cria sessão vazia
cookie:{
    secure: false, //true quando tiver em produção
    httpOnly: true, //Impede ataques de injeção de javascript
    sameSite: 'strict', // Strict -> Só permite o envio de cookies que veem do mesmo domínio
    maxAge: 1000 * 60 * 60 // Equivale a 1 hora  
}
}));


const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//const server = http.createServer(app);
/*
const io = new Server(server, {
    cors:{
       //Quando se tiver a criar as chamadas para o frontend
    }
    
});
*/
app.use(routes);


module.exports = app;



