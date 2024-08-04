// Importa las dependencias necesarias
const express = require('express') // Framework para construir la aplicación web
const cookieParser = require('cookie-parser') // Middleware para analizar cookies
const logger = require('morgan') // Middleware para registrar solicitudes HTTP
const cors = require('cors') // Middleware para habilitar CORS (Cross-Origin Resource Sharing)


// Importa los routers y middlewares personalizados
const statusRouter = require('./routes/status') // Router para manejar rutas relacionadas con el estado del servidor
const authRouter = require('./routes/auth') // Router para manejar rutas de autenticación
const userRouter = require('./routes/user') // Router para manejar rutas relacionadas con usuarios
const authentication = require('./middlewares/authentication') // Middleware para manejar autenticación
const authorization = require('./middlewares/authorization') // Middleware para manejar autorización
const errorHandler = require('./middlewares/errorHandler') // Middleware para manejar errores

// Crea una aplicación Express
const app = express()

// Middleware para registrar solicitudes HTTP en modo de desarrollo
app.use(logger('dev'))

// Middleware para habilitar CORS, permitiendo solicitudes desde diferentes dominios
app.use(cors())

// Middleware para analizar cuerpos de solicitudes JSON
app.use(express.json())

// Middleware para analizar cuerpos de solicitudes con URL codificada
app.use(express.urlencoded({ extended: false }))

// Middleware para analizar cookies en las solicitudes
app.use(cookieParser())

// Middleware de autorización para controlar el acceso a recursos
app.use(authorization)

// Ruta para evitar el error de favicon no encontrado
// Esto evita que el servidor responda con un error 404 cuando el navegador solicita un favicon
app.get('/favicon.ico', (req, res) => res.status(204)) // Responde con un código de estado 204 (Sin contenido)

// Rutas principales de la aplicación
app.use('/', statusRouter) // Usa el router para rutas relacionadas con el estado del servidor
app.use('/auth', authRouter) // Usa el router para rutas de autenticación
app.use('/users', authentication, userRouter) // Usa el router para rutas de usuarios, con autenticación requerida

// Middleware de manejo de errores
// Este middleware captura errores que no han sido manejados en los middlewares o rutas anteriores
app.use(errorHandler)

// Exporta la aplicación para su uso en otros módulos (por ejemplo, en el archivo de arranque)
module.exports = app
