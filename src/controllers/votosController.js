const { votos, eleitores, candidatos, sequelize } = require('../models');

class VotosController {

  // Inserir voto
  async InserirVotos(req, res) {
    try {
      const { candidato_id } = req.body;

      // Pega eleitor da sessão (definido no login/KYC)
      const eleitor_id = req.session.eleitor_id;
      const provincia = req.session.provincia;

      if (!eleitor_id) {
        return res.status(400).json({ error: "Eleitor não autenticado na sessão" });
      }

      // Busca eleitor na base para confirmar existência
      const pegarEleitor = await eleitores.findByPk(eleitor_id);

      if (!pegarEleitor) {
        return res.status(404).json({ error: "Eleitor não encontrado" });
      }

      // Usa provincia da sessão se existir, senão pega do BD
      const provinciaFinal = provincia || pegarEleitor.provincia;

      if (!candidato_id || !provinciaFinal) {
        return res.status(400).json({ error: "Candidato e provincia são necessários" });
      }


      const verificarVoto = await votos.findOne({where:{eleitor_id: pegarEleitor.id}});

      if (verificarVoto) {

        return res.status(400).json({error: "Este eleitor já votou!"});
      }



      // Cria voto
      await votos.create({
        eleitor_id: pegarEleitor.id,
        candidato_id,
        provincia: provinciaFinal
      });

      return res.status(201).json({ success: true, message: "Voto registado com sucesso!" });

    } catch (error) {
      console.error("Erro ao inserir voto:", error);
      return res.status(500).json({ message: "Erro ao inserir voto" });
    }
  }

  // Mostrar votos
  async MostrarVotos(req, res) {
    try {
      const resultado = await candidatos.findAll({
        attributes: [
          'nome',
          'partido',
          [sequelize.fn('COUNT', sequelize.col('votos.id')), 'resultado_total']
        ],
        include: [{
          model: votos,
          attributes: []
        }],
        group: ['candidatos.id'],
        order: [[sequelize.literal('resultado_total'), 'DESC']]
      });

      return res.status(200).json(resultado);

    } catch (error) {
      console.error("Erro ao mostrar votos:", error);
      return res.status(500).json({ message: "Erro ao mostrar votos" });
    }
  }
}

module.exports = new VotosController();
