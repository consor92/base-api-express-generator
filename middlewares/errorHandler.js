const logger = require('./middlewares/logger')

// Middleware de manejo de errores
module.exports = (err, req, res, next) => {
    // Imprime el error en la consola usando el logger
    // El logger es una instancia de Winston u otro sistema de logging que has configurado
    logger.error(err.stack) // Usa Winston para registrar errores

    // Estructura básica de la respuesta de error
    // Prepara la respuesta que se enviará al cliente
    const errorResponse = {
        code: err.status || 500, // Código de estado HTTP. Por defecto es 500 (Error Interno del Servidor)
        message: err.message || 'Internal Server Error', // Mensaje del error. Mensaje por defecto si no se proporciona
    }

    // En entorno de desarrollo, añade información adicional para facilitar la depuración
    // La traza de pila (stack trace) solo se muestra en desarrollo para evitar exponer detalles sensibles en producción
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack // Incluye la traza de pila solo en desarrollo
    }

    // Manejo de errores específicos de Mongoose

    // Error de validación de Mongoose
    // Se produce cuando un documento no cumple con el esquema definido
    if (err.name === 'ValidationError') {
        errorResponse.code = 400 // Código de estado HTTP para errores de solicitud incorrecta
        errorResponse.errors = Object.values(err.errors).map(e => e.message) // Extrae mensajes de error de validación
    }

    // Error de clave duplicada en MongoDB
    // Se produce cuando se intenta insertar un documento con una clave única que ya existe
    if (err.code && err.code === 11000) {
        errorResponse.code = 400 // Código de estado HTTP para errores de solicitud incorrecta
        errorResponse.message = 'Duplicate key error: ' + JSON.stringify(err.keyValue) // Mensaje detallado del error
    }

    // Error de tipo de datos en Mongoose
    // Se produce cuando se proporciona un valor que no coincide con el tipo esperado en el esquema
    if (err.name === 'CastError') {
        errorResponse.code = 400 // Código de estado HTTP para errores de solicitud incorrecta
        errorResponse.message = `Invalid value for ${err.path}: ${err.value}` // Mensaje que describe el error
    }

    // Manejo de errores relacionados con JWT (JSON Web Token)

    // Token JWT inválido
    // Se produce cuando el token proporcionado no es válido
    if (err.name === 'JsonWebTokenError') {
        errorResponse.code = 401 // Código de estado HTTP para errores de autenticación
        errorResponse.message = 'Invalid token' // Mensaje de error específico
    }

    // Token JWT expirado
    // Se produce cuando el token ha expirado
    if (err.name === 'TokenExpiredError') {
        errorResponse.code = 401 // Código de estado HTTP para errores de autenticación
        errorResponse.message = 'Token expired' // Mensaje de error específico
    }

    // Manejo de errores de conexión a MongoDB

    // Error de red de MongoDB
    // Se produce cuando hay problemas al intentar conectarse a la base de datos
    if (err.name === 'MongoNetworkError') {
        errorResponse.code = 503 // Código de estado HTTP para servicio no disponible
        errorResponse.message = 'Database connection error' // Mensaje de error específico
    }

    // Manejo de errores de autorización

    // Error de autorización
    // Se produce cuando un usuario intenta acceder a un recurso al que no tiene permisos
    if (err.name === 'UnauthorizedError') {
        errorResponse.code = 403 // Código de estado HTTP para prohibido
        errorResponse.message = 'Access denied' // Mensaje de error específico
    }

    // Manejo de errores de recursos no encontrados

    // Recurso no encontrado
    // Se produce cuando se solicita un recurso que no existe
    if (err.status === 404) {
        errorResponse.code = 404 // Código de estado HTTP para recurso no encontrado
        errorResponse.message = 'Resource not found' // Mensaje de error específico
    }

    // Manejo de métodos no permitidos

    // Método no permitido
    // Se produce cuando se usa un método HTTP que no está permitido en la ruta solicitada
    if (err.status === 405) {
        errorResponse.code = 405 // Código de estado HTTP para método no permitido
        errorResponse.message = 'Method not allowed' // Mensaje de error específico
    }

    // Envía la respuesta JSON al cliente
    // El cliente recibirá la respuesta con el código de estado y mensaje adecuado
    res.status(errorResponse.code).json(errorResponse)
}
