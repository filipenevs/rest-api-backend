/* EN: Importing a mongodb object modeling
 * PT-BR: Importando uma modelagem de objeto para mongodb
 */
const mongoose = require('mongoose');

/* EN: Importing .env file that contains some values
 * PT-BR: Importando arquivo .env que contém alguns valores
 */
require('dotenv/config');

/* EN: Connecting to the database
 * PT-BR: Conectando ao banco de dados
 */
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = mongoose;
