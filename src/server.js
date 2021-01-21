const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

/* EN: Importing .env file that contains some values
 * PT-BR: Importando arquivo .env que contém alguns valores
 */
require('dotenv/config');

const app = express();

/* EN: Using 'body-parser' and 'cors' to apply some rules
 * PT-BR: Usando o 'body-parser' e 'cors' para aplicar alguns comportamentos
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* EN: Importing controllers
 * PT-BR: Importando controllers
 */
require('./app/controllers/user')(app);

/* EN: Listening server on '.env.PORT', if it does not exist it will use port 3000
 * PT-BR: "Escutando" o servidor na '.env.PORT', caso não exista, usará a porta 3000
 */
app.listen(process.env.PORT || 3003);
