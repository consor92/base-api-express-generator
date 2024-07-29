// Importa la biblioteca Mongoose, una herramienta de modelado de objetos MongoDB para Node.js
const mongoose = require('mongoose')

// Extrae el objeto Schema del módulo Mongoose, que se usa para definir esquemas de datos
const { Schema } = mongoose

// Define un nuevo esquema para la colección 'Role' (rol) en la base de datos MongoDB
const roleSchema = new Schema({
  // Define el campo 'name' del esquema con las siguientes propiedades:
  name: { 
    type: String,          // Tipo de dato: cadena de texto
    required: true,        // Este campo es obligatorio, no puede estar vacío
    lowercase: true,       // Convierte el valor a minúsculas antes de almacenarlo
    trim: true,            // Elimina espacios en blanco al principio y al final del valor
    unique: true,          // Asegura que el valor del campo sea único en la colección
  },
  
  // Define el campo 'description' con las siguientes propiedades:
  description: {
    type: String,          // Tipo de dato: cadena de texto
    trim: true,            // Elimina espacios en blanco al principio y al final del valor
    maxlength: 255,        // Longitud máxima permitida de 255 caracteres
  },
  
  // Define el campo 'permissions' como un objeto con permisos booleanos:
  permissions: {
    read: { 
      type: Boolean,       // Tipo de dato: booleano
      default: false,      // Valor por defecto: falso (sin permiso de lectura)
    },
    write: { 
      type: Boolean,       // Tipo de dato: booleano
      default: false,      // Valor por defecto: falso (sin permiso de escritura)
    },
    update: { 
      type: Boolean,       // Tipo de dato: booleano
      default: false,      // Valor por defecto: falso (sin permiso de actualización)
    },
    delete: { 
      type: Boolean,       // Tipo de dato: booleano
      default: false,      // Valor por defecto: falso (sin permiso de eliminación)
    },
  },
  
  // Define el campo 'createdAt' para almacenar la fecha de creación del documento:
  createdAt: {
    type: Date,            // Tipo de dato: fecha
    default: Date.now,     // Valor por defecto: fecha y hora actuales
  },
  
  // Define el campo 'updatedAt' para almacenar la fecha de la última actualización del documento:
  updatedAt: {
    type: Date,            // Tipo de dato: fecha
    default: Date.now,     // Valor por defecto: fecha y hora actuales
  },
  
  // Define el campo 'isActive' para indicar si el rol está activo o inactivo:
  isActive: {
    type: Boolean,         // Tipo de dato: booleano
    default: true,        // Valor por defecto: verdadero (activo)
  },
})

// Middleware para actualizar la fecha de última modificación antes de guardar el documento
roleSchema.pre('save', function(next) {
  // Actualiza el campo 'updatedAt' con la fecha y hora actuales
  this.updatedAt = Date.now()
  
  // Continúa con el siguiente middleware en la cadena de middlewares
  next()
})

// Crea un modelo basado en el esquema 'roleSchema' y lo nombra 'Role'
// El modelo es una clase con la que construimos instancias de datos que se guardarán en la colección 'roles'
const Role = mongoose.model('Role', roleSchema)

// Exporta el modelo 'Role' para que pueda ser utilizado en otras partes de la aplicación
module.exports = Role
