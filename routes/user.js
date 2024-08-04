// Importa el módulo Express para manejar rutas HTTP
const express = require('express')

// Importa la biblioteca bcrypt para manejar el hashing de contraseñas
const bcrypt = require('bcrypt')

// Importa el modelo de usuario para interactuar con la colección de usuarios en la base de datos
const User = require('../schemas/user')

// Importa el modelo de rol para interactuar con la colección de roles en la base de datos
const Role = require('../schemas/role')

// Crea una nueva instancia de Router para definir rutas relacionadas con usuarios
const router = express.Router()

// Define las rutas y asigna las funciones de controlador correspondientes
router.get('/iniciarMongo', iniciarMongo)
router.get('/', getAllUsers)         // Ruta para obtener todos los usuarios activos
router.get('/:id', getUserById)      // Ruta para obtener un usuario específico por ID

router.post('/', createUser)         // Ruta para crear un nuevo usuario
router.put('/:id', updateUser)       // Ruta para actualizar un usuario específico por ID
router.delete('/:id', deleteUser)    // Ruta para eliminar un usuario específico por ID
router.patch('/:id', patchUser)

// Controlador para obtener todos los usuarios activos
async function getAllUsers(req, res, next) {
  console.log('getAllUsers by user ', req.user._id) // Registra el ID del usuario que está realizando la solicitud
  try {
    // Busca todos los usuarios activos en la colección 'users' y realiza un populate en el campo 'role'
    // El método find() busca documentos que coincidan con el criterio de búsqueda ({ isActive: true })
    // El método populate() reemplaza el campo 'role' con el documento completo del rol
    const users = await User.find({ isActive: true }).populate('role')
    res.send(users) // Envía la lista de usuarios como respuesta
  } catch (err) {
    next(err) // Pasa el error al siguiente middleware de manejo de errores
  }
}

// Controlador para obtener un usuario específico por ID
async function getUserById(req, res, next) {
  console.log('getUser with id: ', req.params.id) // Registra el ID del usuario solicitado

  if (!req.params.id) {
    return res.status(500).send('The param id is not defined') // Envía un error 500 si el ID no está definido
  }

  try {
    // Busca el usuario por ID en la colección 'users' y realiza un populate en el campo 'role'
    // El método findById() busca un documento que coincida con el ID proporcionado
    const user = await User.findById(req.params.id).populate('role')

    if (!user) {
      return res.status(404).send('User not found') // Envía un error 404 si el usuario no se encuentra
    }

    res.send(user) // Envía el usuario encontrado como respuesta
  } catch (err) {
    next(err) // Pasa el error al siguiente middleware de manejo de errores
  }
}

// Controlador para crear un nuevo usuario
async function createUser(req, res, next) {
  console.log('createUser: ', req.body) // Registra la información del usuario a crear

  const user = req.body

  try {
    // Busca el rol correspondiente al nombre del rol proporcionado en la colección 'roles'
    // El método findOne() busca un único documento que coincida con el criterio de búsqueda
    const role = await Role.findOne({ name: user.role })
    if (!role) {
      return res.status(404).send('Role not found') // Envía un error 404 si el rol no se encuentra
    }

    // Hash de la contraseña del usuario con un salto de 10
    // El método hash() toma la contraseña y la encripta usando un algoritmo de hashing
    const passEncrypted = await bcrypt.hash(user.password, 10)

    // Crea el nuevo usuario en la colección 'users'
    // El método create() crea y guarda un nuevo documento en la colección
    const userCreated = await User.create({ ...user, password: passEncrypted, role: role._id })

    res.send(userCreated) // Envía el usuario creado como respuesta
  } catch (err) {
    if (err.name === 'ValidationError') {
      // Manejo de errores de validación (por ejemplo, datos requeridos faltantes)
      // Los errores de validación son errores generados por Mongoose cuando los datos no cumplen con el esquema
      const validationErrors = Object.values(err.errors).map(e => e.message)
      return res.status(400).json({ errors: validationErrors })
    }
    if (err.code && err.code === 11000) {
      // Manejo de errores de duplicación de clave (por ejemplo, email ya en uso)
      // El código 11000 indica un error de duplicado en Mongoose, como un email que ya existe
      return res.status(400).json({ error: 'Email ya está en uso' })
    }
    next(err) // Pasa otros errores al siguiente middleware de manejo de errores
  }
}

// Controlador para actualizar un usuario existente
async function updateUser(req, res, next) {
  console.log('updateUser with id: ', req.params.id) // Registra el ID del usuario a actualizar

  if (!req.params.id) {
    return res.status(404).send('Parameter id not found') // Envía un error 404 si el ID no está definido
  }

  // Verifica que el usuario sea un administrador o esté actualizando su propio perfil
  if (!req.isAdmin() && req.params.id != req.user._id) {
    return res.status(403).send('Unauthorized') // Envía un error 403 si el usuario no está autorizado
  }

  // El correo electrónico no puede ser actualizado
  delete req.body.email

  try {
    // Busca el usuario por ID en la colección 'users'
    // El método findById() busca un documento que coincida con el ID proporcionado
    const userToUpdate = await User.findById(req.params.id)

    if (!userToUpdate) {
      return res.status(404).send('User not found') // Envía un error 404 si el usuario no se encuentra
    }

    // Si se proporciona un nuevo rol, verifica que el rol exista
    if (req.body.role) {
      const newRole = await Role.findById(req.body.role)

      if (!newRole) {
        return res.status(400).end() // Envía un error 400 si el nuevo rol no se encuentra
      }
      req.body.role = newRole._id
    }

    // Si se proporciona una nueva contraseña, realiza el hash de la contraseña
    if (req.body.password) {
      const passEncrypted = await bcrypt.hash(req.body.password, 10)
      req.body.password = passEncrypted
    }

    // Actualiza el usuario con los nuevos datos
    // El método updateOne() actualiza un solo documento que coincide con el criterio de búsqueda
    // También se podría usar save() para guardar los cambios en un documento existente
    await userToUpdate.updateOne(req.body)
    res.send(userToUpdate) // Envía el usuario actualizado como respuesta
  } catch (err) {
    next(err) // Pasa el error al siguiente middleware de manejo de errores
  }
}

// Controlador para eliminar un usuario existente
async function deleteUser(req, res, next) {
  console.log('deleteUser with id: ', req.params.id) // Registra el ID del usuario a eliminar

  if (!req.params.id) {
    return res.status(500).send('The param id is not defined') // Envía un error 500 si el ID no está definido
  }

  try {
    // Busca el usuario por ID en la colección 'users'
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).send('User not found') // Envía un error 404 si el usuario no se encuentra
    }

    // Elimina el usuario por ID en la colección 'users'
    // El método deleteOne() elimina un solo documento que coincide con el criterio de búsqueda
    await User.deleteOne({ _id: user._id })

    res.send(`User deleted :  ${req.params.id}`) // Envía un mensaje de éxito con el ID del usuario eliminado
  } catch (err) {
    next(err) // Pasa el error al siguiente middleware de manejo de errores
  }
}

async function patchUser(req, res, next) {
  console.log('patchUser with id: ', req.params.id) // Registra el ID del usuario que se va a actualizar

  // Verifica que el parámetro 'id' esté presente en la solicitud
  if (!req.params.id) {
    return res.status(404).send('Parameter id not found') // Envía un error 404 si el ID no está definido
  }

  // Verifica si el usuario tiene permisos para realizar la actualización
  // Solo los administradores o el propio usuario pueden actualizar
  if (!req.isAdmin() && req.params.id != req.user._id) {
    return res.status(403).send('Unauthorized') // Envía un error 403 si el usuario no está autorizado
  }

  try {
    // Busca el usuario por ID usando el método findById de Mongoose
    const userToUpdate = await User.findById(req.params.id)

    // Verifica si el usuario existe en la base de datos
    if (!userToUpdate) {
      return res.status(404).send('User not found') // Envía un error 404 si el usuario no se encuentra
    }

    // Usa Object.assign para actualizar el usuario con los datos proporcionados en req.body
    // Solo los campos que están presentes en req.body se actualizarán
    Object.assign(userToUpdate, req.body)

    // Guarda los cambios en la base de datos usando el método save de Mongoose
    await userToUpdate.save()

    // Envía el usuario actualizado como respuesta
    res.send(userToUpdate) 
  } catch (err) {
    // Pasa el error al siguiente middleware de manejo de errores
    next(err) 
  }
}




  
async function iniciarMongo(req, res, next) {
  try {
    // Define los roles predeterminados
    const roles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'client', description: 'Regular client with limited access' },
      { name: 'guest', description: 'Guest user with read-only access' }
    ]

    // Crea los roles en la base de datos si no existen
    for (const roleData of roles) {
      // Usa el método `findOne` para verificar si el rol ya existe
      let role = await Role.findOne({ name: roleData.name })
      if (!role) {
        // Crea el rol si no existe
        role = await Role.create(roleData)
        console.log(`Role created: ${role.name}`)
      } else {
        console.log(`Role already exists: ${role.name}`)
      }
    }

    // Define los usuarios predeterminados
    const users = [
      {
        email: 'admin@baseapinode.com',
        password: 'Password1',
        firstName: 'Admin',
        lastName: 'BaseApiNode',
        role: 'admin',
        isActive: true
      },
      {
        email: 'client@baseapinode.com',
        password: 'Password1',
        firstName: 'Client',
        lastName: 'BaseApiNode',
        role: 'client',
        isActive: true
      }
    ]

    // Crea los usuarios en la base de datos
    for (const userData of users) {
      // Verifica si el usuario ya existe por email
      let user = await User.findOne({ email: userData.email })
      if (!user) {
        // Encripta la contraseña del usuario antes de guardarla
        const passEncrypted = await bcrypt.hash(userData.password, 10)
        user = await User.create({ ...userData, password: passEncrypted })
        console.log(`User created: ${user.email}`)
      } else {
        console.log(`User already exists: ${user.email}`)
      }
    }

    // Envía una respuesta de éxito
    res.status(200).send('Database initialized with roles and users')
  } catch (err) {
    // Pasa cualquier error al middleware de manejo de errores
    next(err)
  }
}



// Exporta el router para que pueda ser utilizado en otras partes de la aplicación
module.exports = router
