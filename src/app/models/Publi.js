const mongoose = require('../../database');

/* EN: Creating the publi schema
 * PT-BR: Criando o esquema (schema) da publicação
 */
const PubliSchema = new mongoose.Schema({
  /* EN: Only some fields are required
   * PT-BR: Apenas alguns campos são obrigatórios
   */

  title: {
    type: String,
    required: true,
  },

  path: {
    type: String,
    required: true,
    /* EN: The path is unique, that is, there cannot be similar paths
     * PT-BR: O caminh (path) é único, ou seja, não podem existir caminhos semelhantes
     */
    unique: true,
  },

  author: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
  },

  content: {
    type: String,
    required: true,
  },

  tags: {
    type: [String],
    required: true,
  },

  /* EN: Date the record will be created (default value)
   * PT-BR: Data em que o registro será criado (valor padrão)
   */
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* EN: Compiling schema into a model
 * PT-BR: Compilando o esquema (schema) em um modelo
 */
const Publi = mongoose.model('Publi', PubliSchema);

module.exports = Publi;
