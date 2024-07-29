/**
 * Middleware para manejar la autorización de usuarios.
 * Agrega métodos al objeto de solicitud `req` para verificar roles de usuario.
 *
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {Object} res - El objeto de respuesta HTTP.
 * @param {Function} next - La función de siguiente middleware en la cadena.
 */
function authorization(req, res, next) {
  /**
   * Método para verificar si el usuario es un administrador.
   * 
   * @returns {Boolean} - Retorna `true` si el usuario es un administrador, `false` en caso contrario.
   * 
   * Ejemplo de uso:
   * if (req.isAdmin()) {
   *   // El usuario es un administrador
   * }
   */
  req.isAdmin = function isAdmin() {
    return req.user && req.user.role === 'admin'
  }

  /**
   * Método para verificar si el usuario es un cliente.
   * 
   * @returns {Boolean} - Retorna `true` si el usuario es un cliente, `false` en caso contrario.
   * 
   * Ejemplo de uso:
   * if (req.isClient()) {
   *   // El usuario es un cliente
   * }
   */
  req.isClient = function isClient() {
    return req.user && req.user.role === 'client'
  }

  /**
   * Método para verificar si el usuario es un moderador.
   * 
   * @returns {Boolean} - Retorna `true` si el usuario es un moderador, `false` en caso contrario.
   * 
   * Ejemplo de uso:
   * if (req.isModerator()) {
   *   // El usuario es un moderador
   * }
   */
  req.isModerator = function isModerator() {
    return req.user && req.user.role === 'moderator'
  }

  /**
   * Método para verificar si el usuario es un editor.
   * 
   * @returns {Boolean} - Retorna `true` si el usuario es un editor, `false` en caso contrario.
   * 
   * Ejemplo de uso:
   * if (req.isEditor()) {
   *   // El usuario es un editor
   * }
   */
  req.isEditor = function isEditor() {
    return req.user && req.user.role === 'editor'
  }

  /**
   * Método para verificar si el usuario es un invitado.
   * 
   * @returns {Boolean} - Retorna `true` si el usuario es un invitado, `false` en caso contrario.
   * 
   * Ejemplo de uso:
   * if (req.isGuest()) {
   *   // El usuario es un invitado
   * }
   */
  req.isGuest = function isGuest() {
    return req.user && req.user.role === 'guest'
  }

  // Continúa con el siguiente middleware en la cadena
  return next(null)
}

// Exporta la función `authorization` para que pueda ser utilizada en otras partes de la aplicación
module.exports = authorization
