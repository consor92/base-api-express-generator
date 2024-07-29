// Importa el módulo Router de Express para crear rutas
const { Router } = require('express')

// Importa el modelo de usuario para interactuar con la colección de usuarios en la base de datos
const User = require('../schemas/user')

// Importa la función que genera el token de usuario
const generateUserToken = require('../utils/generate-user-and-token')

// Crea una nueva instancia de Router para definir las rutas relacionadas con la autenticación
const router = new Router()

// Define una ruta POST para la ruta base del router ('/')
router.post('/', createUserToken)

/**
 * Controlador para crear un token de usuario.
 * 
 * Este controlador verifica las credenciales del usuario, genera un token JWT y lo devuelve.
 * 
 * @param {Object} req - El objeto de solicitud HTTP, que contiene los datos del usuario.
 * @param {Object} res - El objeto de respuesta HTTP, que se usa para enviar una respuesta al cliente.
 * @param {Function} next - La función de siguiente middleware en la cadena.
 */
async function createUserToken(req, res, next) {
  // Registra en la consola que se está creando un token para el usuario con el correo electrónico proporcionado
  console.log(`Creating user token for ${req.body.email}`)

  // Verifica si se ha proporcionado el correo electrónico en el cuerpo de la solicitud
  if (!req.body.email) {
    // Si falta el correo electrónico, registra un error y envía una respuesta 400 (Bad Request) al cliente
    console.error('Missing email parameter. Sending 400 to client')
    return res.status(400).end()
  }

  // Verifica si se ha proporcionado la contraseña en el cuerpo de la solicitud
  if (!req.body.password) {
    // Si falta la contraseña, registra un error y envía una respuesta 400 (Bad Request) al cliente
    console.error('Missing password parameter. Sending 400 to client')
    return res.status(400).end()
  }

  try {
    // Busca al usuario en la base de datos por correo electrónico y también incluye el campo 'password'
    const user = await User.findOne({ email: req.body.email }, '+password')

    // Si no se encuentra el usuario, registra un error y envía una respuesta 401 (Unauthorized) al cliente
    if (!user) {
      console.error('User not found. Sending 404 to client')
      return res.status(401).end()
    }

    // Registra en la consola que se está verificando la contraseña del usuario
    console.log('Checking user password')

    // Verifica si la contraseña proporcionada coincide con la contraseña almacenada del usuario
    const result = await user.checkPassword(req.body.password)

    // Si el usuario está bloqueado, registra un error y envía una respuesta 400 (Bad Request) al cliente
    if (result.isLocked) {
      console.error('User is locked. Sending 400 (Locked) to client')
      return res.status(400).end()
    }

    // Si la contraseña es incorrecta, registra un error y envía una respuesta 401 (Unauthorized) al cliente
    if (!result.isOk) {
      console.error('User password is invalid. Sending 401 to client')
      return res.status(401).end()
    }

    // Si las credenciales son válidas, genera un token JWT para el usuario
    const response = await generateUserToken(req, user)

    // Envía una respuesta 201 (Created) al cliente con el token y la información del usuario
    res.status(201).json(response)
  } catch (err) {
    // Si ocurre un error durante el proceso, pasa el error al siguiente middleware de manejo de errores
    next(err)
  }
}

// Exporta el router para que pueda ser utilizado en otras partes de la aplicación
module.exports = router
