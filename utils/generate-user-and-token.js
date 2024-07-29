// Importa la biblioteca jsonwebtoken para crear y verificar tokens JWT
const jwt = require('jsonwebtoken')
// const fs = require('fs') // Se utiliza para operaciones de sistema de archivos, como leer claves privadas
// const path = require('path') // Se utiliza para manipular rutas de archivos y directorios

// Importa el modelo de Role para obtener información sobre el rol del usuario
const Role = require('../schemas/role')

/**
 * Genera un token JWT para un usuario.
 *
 * @param {Object} req - El objeto de solicitud HTTP. (No se usa directamente en esta función, pero se pasa por convención).
 * @param {Object} user - El objeto del usuario que contiene información como el ID y el rol.
 * @returns {Object} - Un objeto que contiene el token JWT y una respuesta del usuario con información relevante.
 */
async function generateUserToken(req, user) {
  // Busca el rol del usuario en la base de datos usando el ID del rol del usuario
  const role = await Role.findById(user.role).exec()

  // Crea el payload del token que se incluirá en el JWT
  // Payload es la parte del token que contiene la información sobre el usuario
  const payload = {
    _id: user._id,       // ID del usuario
    role: role.name,     // Nombre del rol del usuario
  }

  // Crea un objeto de respuesta del usuario que contiene información relevante
  const userResponse = {
    _id: user._id,       // ID del usuario
    role: role.name,     // Nombre del rol del usuario
    email: user.email,   // Correo electrónico del usuario
    firstName: user.firstName, // Nombre del usuario
    lastName: user.lastName,   // Apellido del usuario
  }

  /* eslint-disable-next-line no-undef */
  // const privateKey = fs.readFileSync(path.join(__dirname, `../keys/base-api-express-generator.pem`))
  // Ejemplo (comentado): Lee una clave privada desde un archivo usando fs y path
  // Esta clave se usaría para firmar el JWT con un algoritmo de clave pública/privada

  // Crea un token JWT usando el payload y una clave secreta
  // Nota: La clave secreta 'base-api-express-generator' se usa para firmar el token
  // Este método es menos seguro comparado con usar una clave privada
  const token = jwt.sign(payload, 'base-api-express-generator', {
    subject: user._id.toString(),    // Identificador del sujeto del token (ID del usuario)
    issuer: 'base-api-express-generator', // Emisor del token
  })

  // Ejemplo de uso de una clave privada para firmar el JWT (comentado):
  // const token = jwt.sign(payload, privateKey, {
  //   subject: user._id.toString(),    // Identificador del sujeto del token (ID del usuario)
  //   issuer: 'base-api-express-generator', // Emisor del token
  //   algorithm: 'RS256', // Algoritmo de firma (RS256 es un algoritmo de clave pública/privada)
  // })

  // Devuelve un objeto que contiene el token y la información del usuario
  return { token, user: userResponse }
}

// Exporta la función para que pueda ser utilizada en otras partes de la aplicación
module.exports = generateUserToken
