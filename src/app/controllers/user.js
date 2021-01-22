const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

/* EN: Importing the JWT tool for authentication
 * PT-BR: Importando a ferramenta de JWT para autenticação
 */
const jwt = require('jsonwebtoken');

/* EN: Importing .env file that contains some values
 * PT-BR: Importando arquivo .env que contém alguns valores
 */
require('dotenv/config');

/* EN: Importing modell and middlewares
 * PT-BR: Importando modelos e middlewares
 */
const User = require('../models/User');
const Publi = require('../models/Publi');
const authMiddleware = require('../middlewares/auth');

/* EN: Function that generates a JWT, receives the user id with parameter
 * PT-BR: Função que gera um JWT, recebe o id do usuário com parâmetro
 */
const generateToken = (user) => {
  return jwt.sign(user, process.env.AUTH_SECRET, {
    expiresIn: 86400,
  });
};

// only for dev======================
router.delete('/deleteall', async (req, res) => {
  await User.deleteMany({});
  res.status(200).send({ situation: 'all deleted' });
});

router.get('/listall', async (req, res) => {
  const allUsers = await User.find().select('+password');
  res.send(allUsers);
});
//===================================

router.post('/', async (req, res) => {
  /* EN: Destructuring the request and placing the email in a constant
   * PT-BR: Desestruturando a requisição e guardando o email numa constante
   */
  const { email } = req.body;
  try {
    /* EN: If there is a similar email registered it is not possible to proceed
     * PT-BR: Se existir algum email semelhante cadastrado, não é possível prosseguir
     */
    if (await User.findOne({ email }))
      return res.status(400).send({ error: 'E-mail already registered' });

    /* EN: Putting a default value in 'admin', will be the master admin if you are the first user in the database
     * PT-BR: Colocando um valor padrão em 'admin, irá ser o master admin se for o primeiro do banco de dados
     *
     *   > 0 == non-admin
     *   > 1 == admin
     *   > 2 == master-fucking-admin
     */
    const numUsers = await User.countDocuments({});
    if (numUsers === 0) req.body.admin = 2;
    else req.body.admin = 0;

    /* EN: Inserting the data into the database
     * PT-BR: Inserindo os dados no banco de dados
     */
    const user = await User.create(req.body);
    user.password = undefined;
    res.status(201).send({ user, token: generateToken({ id: user.id }) });
  } catch (error) {
    res.status(500).send({ error: 'Registration failed' });
  }
});

router.post('/auth', async (req, res) => {
  /* EN: Destructuring the request and placing the email and password in constants
   * PT-BR: Desestruturando a requisição e guardando o email e a senha em constantes
   */
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) return res.status(400).send({ error: 'Incorrect credentials' });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).send({ error: 'Incorrect credentials' });

    user.password = undefined;

    res.status(200).send({ user, token: generateToken({ id: user.id }) });
  } catch (error) {
    res.status(500).send({ error: 'Authentication failed' });
  }
});

/* EN: Functions after middleware require authentication
 * PT-BR: Funções depois do middleware requerem autenticação
 */
router.use(authMiddleware);

/* EN: Function that excludes user, taking '_id' as a parameter
 * PT-BR: Função de excluir usuário, recebendo o '_id' como parâmetro
 */
router.delete('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    /* EN: If the request comes from the user it is accepted
     * PT-BR: Se a requisição vier do próprio usuário ela é aceita
     */
    if (req.userId !== _id) {
      const deleteUser = await User.findOne({ _id });

      if (!deleteUser)
        return res.status(400).send({ error: 'nonexistent user' });

      /* EN: If it is another user who requested it, they must have higher permissions
       * PT-BR: Se for outro usuário que tenha solicitado, ele deve ter permissões superiores
       */
      if (req.userAdm <= deleteUser.admin)
        return res.status(403).send({ error: 'permission denied' });
    }

    await User.deleteOne({ _id });

    /* EN: Deleting publications when the user is deleted
     * PT-BR: Deletando as publicações quando o usuário for deletado
     */
    await Publi.deleteMany({ 'author.id': _id });
    res.status(204).send();
  } catch (error) {
    res.status(500).send({ error: 'delete failed' });
  }
});

/* EN: Function to update name or password, the id is received by the request body
 * PT-BR: Função para atualizar o nome e senha, o id é recebido pelo corpo da requisição
 */
router.put('/', async (req, res) => {
  const _id = req.userId;
  try {
    /* EN: Both data are updated with the same function, it will only be updated if the data is in the request body
     * PT-BR: Os dois dados são atualizados com a mesma função, só será atualizado se o dado estiver no corpo da requisição
     */
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.password)
      updates.password = await bcrypt.hash(req.body.password, 10);

    await User.updateOne({ _id }, updates);
    res.status(204).send();
  } catch (error) {
    res.status(500).send({ error: 'update failed' });
  }
});

/* EN: Exporting routes in '/users' path
 * PT-BR: Exportando rotas no caminho '/users'
 */
module.exports = (app) => app.use('/users', router);
