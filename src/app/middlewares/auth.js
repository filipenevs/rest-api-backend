/* EN: Importing the JWT tool for authentication
 * PT-BR: Importando a ferramenta de JWT para autenticação
 */
const jwt = require('jsonwebtoken');

/* EN: Importing .env file that contains some values
 * PT-BR: Importando arquivo .env que contém alguns valores
 */
require('dotenv/config');

const User = require('../models/User');

module.exports = (req, res, next) => {
  /* EN: Getting the code that was received in the request header
   * PT-BR: Pegando o código que foi recebido no header da requisição
   */
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).send({ error: 'token not received' });

  /* EN: Separating the information into two parts:
   * PT-BR: Separando a informação em duas partes:
   *
   *   > 'Bearer' + Token
   */
  const authParts = authHeader.split(' ');

  /* EN: After 'split()', the token has to be divided into two parts
   * PT-BR: Depois do 'split()', o token tem que ser dividido em duas partes
   */
  if (!authParts.length === 2)
    return res.status(401).send({ error: 'token error' });

  const [bearer, token] = authParts;

  /* EN: Checking if the first part starts with 'bearer' (case insensitive)
   * PT-BR: Verificando se a primeira parte começa com 'bearer' (case insensitive)
   */
  if (!/^bearer$/i.test(bearer))
    return res.status(401).send({ error: 'token error' });

  /* EN: Checking the token with the function of the JWT module
   * PT-BR: Verificando o token com a função do módulo de JWT
   */
  jwt.verify(token, process.env.AUTH_SECRET, async (error, decoded) => {
    /* EN: If there is an error, the operation will not be authorized
     * PT-BR: Se houver algum erro, a operação não será autorizada
     */
    if (error) return res.status(401).send({ error: 'invalid token' });

    /* EN: In case everything is right, we will pass the user id in the request
     * PT-BR: Caso esteja tudo certo, iremos repassar o id do usuário na requisição
     */
    const userQuery = await User.findOne({ _id: decoded.id });

    /* EN: Passing the user id and permissions to the request
     * PT-BR: Repassando o id do usuário e suas permissões para a requisição
     */
    req.userId = decoded.id;
    req.userName = userQuery.name;
    req.userAdm = userQuery.admin;

    /* EN: Calling the 'next()' function to proceed with the request
     * PT-BR: Chamando a função 'next()' para proceder com a requisição
     */
    return next();
  });
};
