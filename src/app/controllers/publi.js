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

/* EN: Functions after middleware require authentication
 * PT-BR: Funções depois do middleware requerem autenticação
 */
router.use(authMiddleware);

router.post('/add', async (req, res) => {
  const { userId, userName, body } = req;
  try {
    body.path = body.title.split(' ').join('-');
    /* EN: If there is a similar email registered it is not possible to proceed
     * PT-BR: Se existir algum email semelhante cadastrado, não é possível prosseguir
     */

    if (await Publi.findOne({ 'author.id': userId, path: body.path }))
      return res
        .status(400)
        .send({ error: 'title/path is already being used by you' });

    body.author.id = userId;
    body.author.name = userName;

    const publi = await Publi.create(body);
    res.status(201).send({ publi });
  } catch (error) {
    res.status(500).send({ error: 'Add failed' });
  }
});

/* EN: Exporting routes in '/publis' path
 * PT-BR: Exportando rotas no caminho '/publis'
 */
module.exports = (app) => app.use('/publis', router);