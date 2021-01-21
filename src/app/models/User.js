const bcrypt = require('bcryptjs');
const mongoose = require('../../database');

/* EN: Creating the user schema
 * PT-BR: Criando o esquema (schema) do usuário
 */
const UserSchema = new mongoose.Schema({
  /* EN: All fields are required
   * PT-BR: Todos os campos são obrigatórios
   */

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    /* EN: The email is unique, that is, there cannot be similar emails
     * PT-BR: O email é único, ou seja, não podem existir emails semelhantes
     */
    unique: true,
    // Forcing/Forçando lowercase
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  admin: {
    type: Number,
    required: true,
    min: 0,
    max: 2,
  },

  /* EN: Date the record will be created (default value)
   * PT-BR: Data em que o registro será criado (valor padrão)
   */
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* EN: Before entering a user into the database, his password will be encrypted
 * PT-BR: Antes de inserir um usuário no banco de dados, sua senha será encriptada
 */
UserSchema.pre('save', async function (next) {
  const passwordHash = await bcrypt.hash(this.password, 10);
  this.password = passwordHash;
  next();
});

/* EN: Compiling schema into a model
 * PT-BR: Compilando o esquema (schema) em um modelo
 */
const User = mongoose.model('User', UserSchema);

module.exports = User;
