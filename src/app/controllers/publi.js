const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

/* EN: Importing .env file that contains some values
 * PT-BR: Importando arquivo .env que contém alguns valores
 */
require('dotenv/config');

/* EN: Importing modell and middlewares
 * PT-BR: Importando modelos e middlewares
 */
const Publi = require('../models/Publi');
const authMiddleware = require('../middlewares/auth');

// only for dev======================
router.delete('/deleteall', async (req, res) => {
  await Publi.deleteMany({});
  res.status(200).send({ situation: 'all deleted' });
});

router.get('/listall', async (req, res) => {
  const allPublis = await Publi.find().select('+password');
  res.send(allPublis);
});
//===================================

router.get('/:path', async (req, res) => {
  const path = req.params.path;
  try {
    const publi = await Publi.findOne({ path });

    if (!publi)
      return res.status(404).send({ error: 'nonexistent publication' });

    res.status(200).send({ publi });
  } catch (error) {
    res.status(500).send({ error: 'Get failed' });
  }
});

/* EN: Functions after middleware require authentication
 * PT-BR: Funções depois do middleware requerem autenticação
 */
router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { userId, userName, body } = req;
  try {
    /* EN: Publication path will be '(base_url)/publis/(last 4 digits of author.id) + title modified'
     * PT-BR: Caminho da publicação será '(base_url)/publis/(últimos 4 digitos do author.id) + título modified'
     */
    body.path = userId.slice(-4) + '-' + body.title.split(' ').join('-');
    /* EN: If there is a similar title/path registered it is not possible to proceed
     * PT-BR: Se existir algum title/path semelhante cadastrado, não é possível prosseguir
     */
    if (await Publi.findOne({ 'author.id': userId, path: body.path }))
      return res
        .status(400)
        .send({ error: 'title/path is already being used by you' });

    /* EN: Passing the id and name of the author (who made the request)
     * PT-BR: Passando o id e nome do autor (quem fez a requisição)
     */
    body.author.id = userId;
    body.author.name = userName;

    const publi = await Publi.create(body);
    res.status(201).send({ publi });
  } catch (error) {
    res.status(500).send({ error: 'Add failed' });
  }
});

router.delete('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const deletePubli = await Publi.findOne({ _id });

    if (!deletePubli)
      return res.status(400).send({ error: 'nonexistent publication' });

    /* EN: If it is another user who requested it, they must have higher permissions
     * PT-BR: Se for outro usuário que tenha solicitado, ele deve ter permissões superiores
     */
    if (deletePubli.author.id !== req.userId) {
      if (req.userAdm == 0)
        return res.status(403).send({ error: 'permission denied' });
    }

    await Publi.deleteOne({ _id });
    res.status(204).send();
  } catch (error) {
    res.status(500).send({ error: 'delete failed' });
  }
});

/* EN: Exporting routes in '/publis' path
 * PT-BR: Exportando rotas no caminho '/publis'
 */
module.exports = (app) => app.use('/publis', router);
