const { Router } = require('express');

const bilheteController = require('./controllers/bilheteController');
const perfil_oficial_cne = require('./controllers/perfilOficialcneController');
//const Utilizadores = require('./controllers/utilizadorController');
const utilizador = require('./controllers/utilizadorController');
const credenciaisController = require('./controllers/credenciaisEleitorController');
const eleitor = require('./controllers/eleitoresController');
const candidatos = require('./controllers/candidatosController'); 
const votar = require('./controllers/votosController'); 

const middleware = require('./middlewares/autenticarSessao');

const sessao = require('./controllers/sessaoController');

const routes = Router();

//routes.get('/perfiloficial', perfil_oficial_cne.verificarPerfilCNE);
routes.post('/verificar', bilheteController.ValidarBilhetes);
//routes.post('/perfiloficial', perfil_oficial_cne.verificarPerfilCNE);
//routes.get('/usuario', Utilizadores.utilizadorControl);
routes.get('/criarUtilizador', utilizador.cadastrarUtilizadores);

routes.post('/eleitor/auth', eleitor.verificarEleitor);
routes.post('/eleitor/validarKYC', eleitor.validarKYCEleitor);

routes.get('/candidatos', candidatos.MostrarCandidatos);

routes.post('/votar', votar.InserirVotos);

routes.get('/bilhete', middleware, bilheteController.mostarBilhetes);

routes.get('/sessao/validar', sessao.validarRota);




routes.post('/enviar/webauthn', credenciaisController.iniciarRegisto);
routes.post('/enviar/webauthn/verificar', credenciaisController.verificarRegisto);

// Rotas de login WebAuthn
routes.post('/enviar/webauthn/iniciar-login', credenciaisController.iniciarLogin);
routes.post('/enviar/webauthn/verificar-login', credenciaisController.verificarLogin);



module.exports = routes;