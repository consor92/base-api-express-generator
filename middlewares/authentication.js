// Importa la biblioteca jsonwebtoken para trabajar con JSON Web Tokens (JWT)
const jwt = require('jsonwebtoken')
// Importa la biblioteca http-errors para crear errores HTTP personalizados
const createError = require('http-errors')
// const fs = require('fs') // Módulo para operaciones de sistema de archivos, como leer claves públicas
// const path = require('path') // Módulo para manipular rutas de archivos y directorios

/* eslint-disable-next-line no-undef */
// const publicKey = fs.readFileSync(path.join(__dirname, `../keys/base-api-express-generator.pub`))
// Ejemplo (comentado): Lee una clave pública desde un archivo usando fs y path
// Esta clave se usaría para verificar el JWT usando un algoritmo de clave pública/privada

/**
 * Extrae el token JWT del encabezado Authorization.
 *
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {Function} next - La función de siguiente middleware en la cadena.
 * @returns {String} - El token JWT extraído del encabezado.
 */
function getToken(req, next) {
  // Expresión regular para extraer el token del encabezado Authorization
  const TOKEN_REGEX = /^\s*Bearer\s+(\S+)/g
  // Ejecuta la expresión regular en el encabezado Authorization
  const matches = TOKEN_REGEX.exec(req.headers.authorization)

  // Si no se encuentra un token en el encabezado, genera un error de autorización
  if (!matches) {
    return next(new createError.Unauthorized())
  }

  // Extrae el token de los resultados de la expresión regular
  const [, token] = matches
  return token
}

/**
 * Middleware para autenticar al usuario usando un token JWT.
 *
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {Object} res - El objeto de respuesta HTTP.
 * @param {Function} next - La función de siguiente middleware en la cadena.
 */
function authentication(req, res, next) {
  // Verifica si el encabezado Authorization está presente en la solicitud
  if (!req.headers.authorization) {
    console.error('Missing authorization header')
    return next(new createError.Unauthorized())
  }

  // Extrae el token del encabezado Authorization
  const token = getToken(req, next)

  try {
    // Verifica y decodifica el token JWT usando una clave secreta (alternativa menos segura)
    req.user = jwt.verify(token, 'base-api-express-generator', {
      issuer: 'base-api-express-generator', // Emisor del token
    })

    // Alternativa segura: Verificar y decodificar el token JWT usando una clave pública
    // req.user = jwt.verify(token, publicKey, {
    //   algorithms: ['RS256'], // Algoritmo de firma
    //   issuer: 'base-api-express-generator', // Emisor del token
    // })

    // Verifica si el token tiene un ID de usuario y un rol válidos
    if (!req.user || !req.user._id || !req.user.role) {
      console.error('Error authenticating malformed JWT')
      return next(new createError.Unauthorized())
    }

    // Registra la autenticación del usuario en la consola
    console.info(`User ${req.user._id} authenticated`)

    // Continúa con el siguiente middleware
    next(null)
  } catch (err) {
    // Manejo de errores para JWT con algoritmos inválidos o firma inválida
    if (err.message === 'invalid algorithm' || err.message === 'invalid signature') {
      // Obtiene la dirección IP del cliente
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      console.error(`Suspicious access attempt from ip=${ip} ${token}`)
    }
    // Manejo de errores para tokens expirados
    if (err.name === 'TokenExpiredError') {
      console.error('Expired token, sending 401 to client')
      return res.sendStatus(401) // Envía un estado 401 (No Autorizado) al cliente
    }
    // Manejo de errores generales y pasa el error al siguiente middleware
    return next(new createError.Unauthorized(err))
  }
}

// Exporta la función de middleware para que pueda ser utilizada en otras partes de la aplicación
module.exports = authentication
