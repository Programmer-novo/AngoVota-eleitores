const { eleitores, bilhetes_identidade, sequelize} = require('../models');

//001234567LA001

class EleitoresController{
    async verificarEleitor(req, res){

        try{

            const perfilNumberEleitor = 1;

            const { numeroBI } = req.body;


            if(!numeroBI) return res.status(401).json({error: 'Número do bilhete obrigatório'});

            const bilheteVerifyEleitor = await bilhetes_identidade.findOne({
             attributes:[
                [sequelize.fn('pgp_sym_decrypt',
                     sequelize.col('numero_bi_enc'),
                     process.env.MinhaChave),
                     'numero_bi_decriptografado'],

                     'id'
                  ],

                  where:sequelize.where(sequelize.fn('pgp_sym_decrypt',
                     sequelize.col('numero_bi_enc'), process.env.MinhaChave),
                     numeroBI
                    )

            });




            if (!bilheteVerifyEleitor) return res.status(404).json({message: 'Número não encontrado, BI'});


              console.log(bilheteVerifyEleitor);


            const verificar = await eleitores.findOne({where:{ bilhete_id: bilheteVerifyEleitor.id }});

            if (verificar) return res.status(401).json({error:'Perfil de eleitor já registrado!'});


            req.session.eleitor_id = bilheteVerifyEleitor.id;

            req.session.perfilNumberEleitor = perfilNumberEleitor;

            //req.session.biEleitor = bilheteVerifyEleitor.id;
    
            //req.session.perfilNumberEleitor = perfilNumberEleitor;


                return res.status(200).json(verificar);

        }catch(err){

            console.log(err)
            return res.status(401).json({message: 'Erro ao verificar eleitor'});

        }
        
        
    }


    async validarKYCEleitor(req, res){

        try{

            const { ativo } = req.body;

            if(!ativo && !req.session.eleitor_id && !req.session.perfilNumberEleitor){
              delete req.session.eleitor_id;
              delete req.session.perfilNumberEleitor;
              return res.status(401).json({error: 'KYC não realizado, ou falhado'});
            }

            const bi = req.session.eleitor_id;

            const perfil = req.session.perfilNumberEleitor;
            const kyc_concluido = ativo

            req.session.kyc = kyc_concluido;

            async function localization(ip) {

                    try{
  
                          const token = process.env.Token;

                          const resposta = await fetch(`https://ipinfo.io/${ip}?token=${token}`);

                          const dados = await resposta.json();

                          return{
                            cidade: dados.city,
                            provincia: dados.region,
                            pais: dados.country
                          };

                          }

                          catch(err){
                            console.error('Erro ao localizar', err);
                            return null
                          }
                          
            }

            const ip = req.pegarInformacoes?.ip;

                let listaProvincias = [

                    'Luanda',
                    'Bengo',
                    'Benguela',
                    'Bié',
                    'Cabinda',
                    'Cuando Cubango',
                    'Cuanza Norte',
                    'Cuanza Sul',
                    'Cunene',
                    'Huambo',       
                    'Huíla',
                    'Icolo e Bengo',      
                    'Lunda Norte',
                    'Lunda Sul',
                    'Malanje',
                    'Moxico',
                    'Moxico Leste',
                    'Namibe',
                    'Uíge',
                    'Zaire'
             ];


            const provincia = listaProvincias[Math.floor(Math.random() * listaProvincias.length)]



            // Quando estiver em produção

            if (ip !== '127.0.0.0' && ip !== '::1') {


                const localizacao = await localization(ip);

                if (localizacao?.provincia) {


                    const provincia = localizacao?.provincia;

                }
                
            }
        

            console.log(`${provincia}`);


            const criarEleitor = await eleitores.create({bilhete_id:bi, provincia});

             req.session.eleitor_id = criarEleitor.id

             req.session.provincia = criarEleitor.provincia;

            return res.status(200).json({message: 'KYC concluído com sucesso!'});

        }catch(error){
            console.log(error)
            return res.status(401).json({message: 'Erro ao validar KYC', error});

        }

     
    }


    
}

module.exports = new EleitoresController();