// =========================================================================
// IMPORTACIÓN DE DEPENDENCIAS Y MÓDULOS
// =========================================================================

// Importa el framework Express para la gestión de rutas y peticiones HTTP
const express = require('express')

// Importa Bcrypt, una librería para encriptar (hashing) contraseñas de forma segura
const bcrypt = require('bcrypt')

// Importa el modelo de Mongoose 'User' que representa la colección de usuarios en MongoDB
const User = require('../schemas/user')

// Importa el modelo de Mongoose 'Role' que representa la colección de roles en MongoDB
const Role = require('../schemas/role')

// Inicializa el Router de Express para empaquetar y exportar este grupo de rutas de forma modular
const router = express.Router()

// =========================================================================
// DEFINICIÓN DE ENRUTAMIENTO (ENDPOINTS)
// Asocia un método HTTP y una URL con su función controladora correspondiente
// =========================================================================

// GET / -> Obtiene la lista completa de usuarios activos. Requiere permisos de Admin.
router.get('/', getAllUsers)         

// GET /:id -> Obtiene un usuario específico mediante su ID en la URL. Accesible por Admin o el propio usuario.
router.get('/:id', getUserById)      

// POST / -> Crea un nuevo usuario en el sistema (Registro).
router.post('/', createUser)         

// PUT /:id -> Actualiza/Reemplaza por completo los datos de un usuario por su ID.
router.put('/:id', updateUser)       

// PATCH /:id -> Actualiza de manera parcial solo los campos enviados de un usuario por su ID.
router.patch('/:id', patchUser)      

// DELETE /:id -> Elimina de forma permanente un usuario del sistema por su ID. Solo permitido para Admins.
router.delete('/:id', deleteUser)    

// GET /iniciarMongo -> Ruta utilitaria encargada de poblar (seed) la base de datos con roles y un admin inicial.
router.get('/iniciarMongo', iniciarMongo)


// =========================================================================
// CONTROLADORES: LÓGICA DE NEGOCIO Y MANEJO DE PETICIONES
// =========================================================================

/**
 * 1. OBTENER TODOS LOS USUARIOS
 * @route GET /
 * @access Privado (Solo Administradores)
 */
async function getAllUsers(req, res, next) {
  // CONTROL DE ACCESO: Verifica si el método personalizado 'req.isAdmin()' inyectado por el middleware devuelve false.
  // Si no es administrador, corta la ejecución inmediatamente y devuelve un código 403 (Prohibido/Forbidden).
  if (!req.isAdmin || !req.isAdmin()) {
    return res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'No tienes permisos (Admin) para ver la lista completa de usuarios.'
    })
  }

  try {
    // CONSULTA BASE DE DATOS: 
    // - .find({ isActive: true }) -> Filtra y trae solo los usuarios cuyo estado sea activo.
    // - .populate('role') -> Mongoose busca en la colección de roles el documento cuyo ID coincida y lo incrusta.
    // - .select('-password') -> EXCLUSIÓN DE SEGURIDAD: Indica que traiga todos los campos MENOS la contraseña encriptada.
    const users = await User.find({ isActive: true }).populate('role').select('-password')
    
    // RESPUESTA EXITOSA: Devuelve un estado 200 (OK) junto con el arreglo de usuarios en formato JSON.
    return res.status(200).json(users)
  } catch (err) {
    // MANEJO DE ERRORES: Si ocurre un fallo del servidor (ej: pérdida de conexión a BD), se envía al middleware global de errores.
    return next(err)
  }
}

/**
 * 2. OBTENER UN USUARIO POR SU ID
 * @route GET /:id
 * @access Privado (Admin o el propio Dueño de la cuenta)
 */
async function getUserById(req, res, next) {
  // Extrae el parámetro 'id' de la URL (ej: /users/65f1a2b3... -> id = '65f1a2b3...')
  const { id } = req.params

  // VALIDACIÓN DE ENTRADA: Si por alguna razón el ID viene vacío, es un error del cliente (400 Bad Request).
  if (!id) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'El parámetro ID es requerido en la URL.'
    })
  }

  // CONTROL DE ACCESO: Un usuario con rol común ('client') SOLO puede ver sus propios datos (id de la URL === id de su sesión token).
  // Si no es Admin Y el ID solicitado no coincide con su ID autenticado, se le deniega el acceso (403 Forbidden).
  if (!req.isAdmin() && id != req.user._id) {
    return res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'No estás autorizado para consultar la información de este usuario.'
    })
  }

  try {
    // CONSULTA BASE DE DATOS: Busca un único documento por su identificador único de MongoDB (_id).
    // También aplicamos populate para el rol y excluimos la contraseña por privacidad.
    const user = await User.findById(id).populate('role').select('-password')

    // VALIDACIÓN DE EXISTENCIA: Si Mongoose devuelve 'null', significa que el ID tiene el formato correcto pero no existe el registro.
    // Se responde con un estado 404 (Not Found).
    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'El usuario con el ID especificado no existe.'
      })
    }

    // RESPUESTA EXITOSA: Devuelve los datos del usuario encontrado con estado 200 (OK).
    return res.status(200).json(user)
  } catch (err) {
    // Pasa cualquier error inesperado al gestor centralizado de errores de Express.
    return next(err)
  }
}

/**
 * 3. CREAR UN NUEVO USUARIO
 * @route POST /
 * @access Público / Privado
 */
async function createUser(req, res, next) {
  // Obtiene los datos enviados por el cliente desde el cuerpo de la petición (JSON)
  const userData = req.body

  try {
    // REGLA DE NEGOCIO: Si el cliente no especifica un rol en el JSON de registro, se le asigna por defecto el rol 'client'.
    const roleName = userData.role || 'client'
    
    // CONSULTA BASE DE DATOS: Busca en la colección de roles el documento que coincida con el nombre del rol.
    const role = await Role.findOne({ name: roleName })
    
    // VALIDACIÓN DE CONSISTENCIA: Si el rol buscado no existe en la base de datos, no podemos continuar. Error 404.
    if (!role) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `El rol '${roleName}' no existe en el sistema.`
      })
    }

    // ENCRIPCION DE SEGURIDAD: Toma la contraseña en texto plano y le aplica un algoritmo de hashing con 10 rondas de sal (salt).
    // Esto asegura que si la base de datos es hackeada, las contraseñas de los usuarios permanezcan indescifrables.
    const passEncrypted = await bcrypt.hash(userData.password, 10)
    
    // INSERCIÓN EN BASE DE DATOS: Crea y guarda de forma atómica el nuevo usuario en MongoDB.
    // Usamos el operador spread (...userData) para clonar los campos recibidos, pero pisamos la contraseña con la encriptada 
    // y vinculamos el campo 'role' con el ObjectId correspondiente del rol encontrado en la BD.
    const userCreated = await User.create({ 
      ...userData, 
      password: passEncrypted, 
      role: role._id 
    })

    // LIMPIEZA DE RESPUESTA: 'userCreated' es un documento complejo de Mongoose. Lo convertimos a un objeto nativo de JavaScript (.toObject())
    // para poder eliminar de forma segura la propiedad 'password' antes de enviarla al cliente.
    const userResponse = userCreated.toObject()
    delete userResponse.password

    // RESPUESTA EXITOSA: 201 significa "Created" (Recurso creado con éxito en el servidor).
    return res.status(201).json(userResponse)

  } catch (err) {
    // CAPTURA DE ERRORES DE VALIDACIÓN (Mongoose Schema):
    // Se ejecuta si fallan validaciones del esquema (ej: el email no tiene formato válido o falta un campo requerido como 'firstName').
    if (err.name === 'ValidationError') {
      // Extrae todos los mensajes de error configurados en el Schema y los mapea en un arreglo limpio.
      const validationErrors = Object.values(err.errors).map(e => e.message)
      return res.status(400).json({
        status: 400,
        error: 'ValidationError',
        message: 'Los datos enviados no cumplen con los requisitos mínimos.',
        errors: validationErrors // Envía la lista detallada de qué campos fallaron
      })
    }
    
    // CAPTURA DE ERROR DE DUPLICIDAD (MongoDB):
    // El código 11000 ocurre cuando se viola una restricción de índice único (ej: en el Schema de User se configuró 'email: { unique: true }').
    if (err.code === 11000) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'El correo electrónico ya se encuentra registrado por otro usuario.'
      })
    }
    
    // Deriva cualquier otro tipo de error al middleware general.
    return next(err)
  }
}

/**
 * 4. ACTUALIZAR USUARIO COMPLETO
 * @route PUT /:id
 * @access Privado (Admin o el propio Dueño de la cuenta)
 */
async function updateUser(req, res, next) {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'El parámetro ID es requerido.'
    })
  }

  // CONTROL DE ACCESO: Impide que usuarios comunes editen perfiles ajenos (403 Forbidden).
  if (!req.isAdmin() && id != req.user._id) {
    return res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'No tienes permisos para modificar este perfil.'
    })
  }

  // PROTECCIÓN DE DATOS CRÍTICOS (Escalada de privilegios): 
  // Si el usuario que realiza la petición NO es administrador, eliminamos del cuerpo de la solicitud (`req.body`) los campos 
  // 'email' y 'role'. Esto evita que un usuario común se cambie el correo a uno no verificado o se promueva a sí mismo a Admin.
  if (!req.isAdmin()) {
    delete req.body.email  
    delete req.body.role   
  }

  try {
    // CONSULTA BASE DE DATOS: Busca si el usuario a modificar existe en la BD.
    const userToUpdate = await User.findById(id)
    if (!userToUpdate) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Usuario no encontrado.'
      })
    }

    // VALIDACIÓN DE ROL: Si un Administrador está cambiando el rol del usuario, verificamos primero que el ID del nuevo rol exista.
    if (req.body.role) {
      const newRole = await Role.findById(req.body.role)
      if (!newRole) {
        return res.status(400).json({
          status: 400,
          error: 'Bad Request',
          message: 'El ID del nuevo rol proporcionado no es válido.'
        })
      }
      req.body.role = newRole._id
    }

    // ENCRIPCION DE CONTRASEÑA: Si el JSON de actualización incluye un cambio de contraseña, la encriptamos antes de impactar la BD.
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10)
    }

    // MODIFICACIÓN EN BASE DE DATOS: Aplica los cambios provistos en req.body sobre el documento de manera directa.
    await userToUpdate.updateOne(req.body)
    
    // RE-CONSULTA DE CONFIRMACIÓN: Volvemos a buscar el usuario recién actualizado para traer sus datos frescos y limpios, 
    // resolviendo el objeto del rol actual y quitando el password de la respuesta.
    const updatedUser = await User.findById(id).populate('role').select('-password')
    
    // RESPUESTA EXITOSA: Devuelve el usuario modificado con estado 200 (OK).
    return res.status(200).json(updatedUser)
  } catch (err) {
    return next(err)
  }
}

/**
 * 5. MODIFICAR PARCIALMENTE UN USUARIO
 * @route PATCH /:id
 * @access Privado (Admin o el propio Dueño de la cuenta)
 */
async function patchUser(req, res, next) {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'El parámetro ID es requerido.'
    })
  }

  // CONTROL DE ACCESO
  if (!req.isAdmin() && id != req.user._id) {
    return res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'No estás autorizado para modificar este perfil.'
    })
  }

  // PROTECCIÓN DE SEGURIDAD: Evita modificaciones no permitidas a usuarios estándar.
  if (!req.isAdmin()) {
    delete req.body.email
    delete req.body.role
  }

  try {
    const userToUpdate = await User.findById(id)
    if (!userToUpdate) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Usuario no encontrado.'
      })
    }

    // LÓGICA DE FUSIÓN (PATCH): 'Object.assign' toma el documento original de Mongoose (userToUpdate) y sobrescribe en él 
    // ÚNICAMENTE las propiedades que vienen dentro de 'req.body'. Las propiedades que no se enviaron quedan intactas.
    Object.assign(userToUpdate, req.body)
    
    // GUARDADO EN BASE DE DATOS: Ejecuta el método .save() que dispara los hooks de validación interna de Mongoose.
    await userToUpdate.save()

    // Oculta la contraseña en la respuesta final de JS.
    const response = userToUpdate.toObject()
    delete response.password

    return res.status(200).json(response)
  } catch (err) {
    return next(err)
  }
}

/**
 * 6. ELIMINAR USUARIO
 * @route DELETE /:id
 * @access Privado (Estrictamente Administradores)
 */
async function deleteUser(req, res, next) {
  const { id } = req.params

  // CONTROL DE ACCESO CRÍTICO: Eliminar un recurso del sistema es una acción destructiva de alto nivel.
  // Por ende, restringimos esta funcionalidad de manera estricta para que ningún cliente pueda auto-eliminarse o eliminar a otros.
  if (!req.isAdmin || !req.isAdmin()) {
    return res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'Acceso denegado. Solo los administradores pueden eliminar usuarios.'
    })
  }

  if (!id) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'El parámetro ID es requerido.'
    })
  }

  try {
    const user = await User.findById(id)
    // Si no existe el usuario a eliminar, informamos al cliente con un 404 (No encontrado).
    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'El usuario que intentas eliminar no existe.'
      })
    }

    // ELIMINACIÓN DE LA BASE DE DATOS: Remueve de manera permanente el documento coincidente de la colección.
    await User.deleteOne({ _id: user._id })
    
    // RESPUESTA ESTÁNDAR DE ÉXITO: En lugar de retornar datos vacíos, devolvemos un JSON descriptivo con el ID borrado y la hora.
    return res.status(200).json({
      status: 200,
      message: 'El usuario ha sido eliminado correctamente del sistema.',
      deletedId: id,
      timestamp: new Date()
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * 7. INICIALIZAR LA BASE DE DATOS (SEEDER)
 * @route GET /iniciarMongo
 * @access Público / Utilitario
 */
async function iniciarMongo(req, res, next) {
  try {
    // Define la estructura base de los roles obligatorios de la aplicación.
    const roles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'client', description: 'Regular client with limited access' }
    ]

    // BUCLE DE POBLACIÓN: Recorre el arreglo de roles y verifica uno a uno si ya existen en la base de datos.
    for (const roleData of roles) {
      let role = await Role.findOne({ name: roleData.name })
      // Si no existe el rol, lo crea en ese instante. Si existe, lo ignora para no duplicar datos.
      if (!role) await Role.create(roleData)
    }

    // Define un usuario Administrador inicial para poder ingresar al sistema por primera vez.
    const users = [
      {
        email: 'admin@baseapinode.com',
        password: 'Password1',
        firstName: 'Admin',
        lastName: 'BaseApiNode',
        role: 'admin',
        isActive: true
      }
    ]

    // BUCLE DE POBLACIÓN DE USUARIOS:
    for (const userData of users) {
      let user = await User.findOne({ email: userData.email })
      if (!user) {
        // Encripta la contraseña por defecto del administrador
        const passEncrypted = await bcrypt.hash(userData.password, 10)
        
        // Busca el ID real asignado por MongoDB para el rol 'admin' creado en el paso anterior.
        const adminRole = await Role.findOne({ name: 'admin' })
        
        // Inserta el usuario vinculando correctamente el ObjectId del rol de administrador.
        await User.create({ ...userData, password: passEncrypted, role: adminRole._id })
      }
    }

    // Devuelve un JSON de éxito informando que el sistema ya cuenta con datos para operar.
    return res.status(200).json({ 
      status: 200,
      message: 'Base de datos inicializada con éxito con roles y usuarios por defecto.' 
    })
  } catch (err) {
    return next(err)
  }
}

// Exporta el módulo del router completamente configurado para que la aplicación principal (app.js) pueda mapearlo bajo la ruta '/users'
module.exports = router