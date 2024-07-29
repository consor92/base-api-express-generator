// Importa la biblioteca de Mongoose, que es una herramienta de modelado de objetos de MongoDB para Node.js
const mongoose = require('mongoose')
// Importa el validador de Mongoose para validaciones adicionales
const validate = require('mongoose-validator')
// Importa bcrypt, una biblioteca para hashing de contraseñas
const bcrypt = require('bcrypt')

// Extrae el objeto Schema del módulo mongoose
const Schema = mongoose.Schema
// Extrae ObjectId del Schema.Types para utilizarlo como tipo de campo en el esquema
const { ObjectId } = Schema.Types
// Define un validador de email utilizando mongoose-validator
const emailValidator = validate({ validator: 'isEmail' })


// Definición de validadores usando mongoose-validator
/*
const emailValidator = validate({ validator: 'isEmail', message: 'Por favor ingrese un email válido' })
const urlValidator = validate({ validator: 'isURL', message: 'Por favor ingrese una URL válida' })
const ipValidator = validate({ validator: 'isIP', message: 'Por favor ingrese una dirección IP válida' })
const phoneValidator = validate({ validator: 'isMobilePhone', args: ['es-AR'], message: 'Por favor ingrese un número de teléfono válido' })
const alphaValidator = validate({ validator: 'isAlpha', message: 'El campo debe contener solo letras' })
const alphanumericValidator = validate({ validator: 'isAlphanumeric', message: 'El campo debe contener solo letras y números' })
const numericValidator = validate({ validator: 'isNumeric', message: 'El campo debe contener solo números' })
const intValidator = validate({ validator: 'isInt', message: 'El campo debe ser un número entero' })
const floatValidator = validate({ validator: 'isFloat', message: 'El campo debe ser un número flotante' })
const inValidator = validate({ validator: 'isIn', arguments: [['admin', 'user', 'guest']], message: 'El valor debe ser uno de: admin, user, guest' })
const matchesValidator = validate({ validator: 'matches', arguments: [/^[a-zA-Z0-9]{6,30}$/, 'i'], message: 'El campo debe contener solo letras y números, y tener entre 6 y 30 caracteres' })
const lengthValidator = validate({ validator: 'isLength', arguments: [6, 255], message: 'La longitud debe estar entre {ARGS[0]} y {ARGS[1]} caracteres' })
const base64Validator = validate({ validator: 'isBase64', message: 'Por favor ingrese una cadena base64 válida' })
const booleanValidator = validate({ validator: 'isBoolean', message: 'Por favor ingrese un valor booleano' })
const creditCardValidator = validate({ validator: 'isCreditCard', message: 'Por favor ingrese un número de tarjeta de crédito válido' })
const currencyValidator = validate({ validator: 'isCurrency', message: 'Por favor ingrese una cantidad monetaria válida' })
const dateValidator = validate({ validator: 'isDate', message: 'Por favor ingrese una fecha válida' })
const hexColorValidator = validate({ validator: 'isHexColor', message: 'Por favor ingrese un color hexadecimal válido' })
const jsonValidator = validate({ validator: 'isJSON', message: 'Por favor ingrese una cadena JSON válida' })
const lowercaseValidator = validate({ validator: 'isLowercase', message: 'El campo debe estar en minúsculas' })
const uppercaseValidator = validate({ validator: 'isUppercase', message: 'El campo debe estar en mayúsculas' })
const uuidValidator = validate({ validator: 'isUUID', message: 'Por favor ingrese un UUID válido' })

*/


// Validator for password length
const lengthValidator = validate({
  validator: 'isLength',
  arguments: [6, 255],
  message: 'La contraseña debe tener entre {ARGS[0]} y {ARGS[1]} caracteres',
})

// Custom validator for password to ensure it contains at least one number
const containsNumberValidator = {
  validator: function (value) {
    return /\d/.test(value)
  },
  message: 'La contraseña debe contener al menos un número',
}

// Custom validator for password to ensure it contains at least one uppercase letter
const containsUppercaseValidator = {
  validator: function (value) {
    return /[A-Z]/.test(value)
  },
  message: 'La contraseña debe contener al menos una letra mayúscula',
}



// Define los tipos de identificaciones gubernamentales permitidas
const governmentIdTypes = ['cuil', 'cuit', 'dni', 'lc', 'le', 'pas']

// Define un nuevo esquema para la colección 'User' (usuario) en la base de datos
const userSchema = new Schema({
  // Define el campo 'email' con las siguientes propiedades:
  email: {
    type: String,           // El tipo de datos es una cadena de texto
    required: true,         // Este campo es obligatorio, no puede estar vacío
    unique: true,           // Asegura que cada valor sea único en la colección
    lowercase: true,        // Almacena el valor en minúsculas
    trim: true,             // Elimina espacios en blanco al principio y al final del valor
    validate: emailValidator // Valida que el valor sea un email válido
  },
  // Define el campo 'password' con las siguientes propiedades:
  password: { 
    type: String,           // El tipo de datos es una cadena de texto
    required: true,         // Este campo es obligatorio, no puede estar vacío
    select: false,           // Este campo no se incluirá por defecto en las consultas
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    validate: [lengthValidator,
      containsNumberValidator,
      containsUppercaseValidator,
    ],
  },
  // Define el campo 'role' como una referencia a la colección 'Role'
  role: { 
    type: ObjectId,         // El tipo de datos es ObjectId, una referencia a otro documento
    ref: 'Role',            // Ref es la colección a la que hace referencia (en este caso, 'Role')
    required: true          // Este campo es obligatorio, no puede estar vacío
  },
  // Define el campo 'firstName' con las siguientes propiedades:
  firstName: { 
    type: String,           // El tipo de datos es una cadena de texto
    required: true,         // Este campo es obligatorio, no puede estar vacío
    lowercase: true,        // Almacena el valor en minúsculas
    trim: true              // Elimina espacios en blanco al principio y al final del valor
  },
  // Define el campo 'lastName' con las siguientes propiedades:
  lastName: { 
    type: String,           // El tipo de datos es una cadena de texto
    required: true,         // Este campo es obligatorio, no puede estar vacío
    lowercase: true,        // Almacena el valor en minúsculas
    trim: true              // Elimina espacios en blanco al principio y al final del valor
  },
  // Define el campo 'phone' con las siguientes propiedades:
  phone: { 
    type: String,           // El tipo de datos es una cadena de texto
    trim: true              // Elimina espacios en blanco al principio y al final del valor
  },
  // Define el campo 'governmentId' con las siguientes propiedades:
  governmentId: {
    type: { 
      type: String,         // El tipo de identificación gubernamental (uno de los valores permitidos)
      enum: governmentIdTypes // Solo permite valores definidos en governmentIdTypes
    },
    number: { 
      type: String,         // El número de identificación gubernamental
      trim: true            // Elimina espacios en blanco al principio y al final del valor
    }
  },
  // Define el campo 'bornDate' con las siguientes propiedades:
  bornDate: { 
    type: Date             // El tipo de datos es una fecha
  },
  // Define el campo 'isActive' con las siguientes propiedades:
  isActive: { 
    type: Boolean,          // El tipo de datos es un booleano
    default: true           // Valor por defecto es true
  },
})

// Crea un índice único en los campos 'governmentId.type' y 'governmentId.number'
userSchema.index({ 'governmentId.type': 1, 'governmentId.number': 1 }, { unique: true })

// Define un método de instancia para verificar la contraseña del usuario
userSchema.method('checkPassword', async function checkPassword(potentialPassword) {
  if (!potentialPassword) {
    return Promise.reject(new Error('Password is required'))
  }

  // Compara la contraseña proporcionada con la contraseña almacenada (hashed)
  const isMatch = await bcrypt.compare(potentialPassword, this.password)

  // Devuelve un objeto indicando si la contraseña es correcta y si la cuenta está activa
  return { isOk: isMatch, isLocked: !this.isActive }
})

// Crea un modelo llamado 'User' basado en el esquema userSchema
// Un modelo es una clase con la que construimos documentos (instancias de datos) que se guardarán en la base de datos
const User = mongoose.model('User', userSchema)

// Exporta el modelo 'User' para que pueda ser usado en otras partes de la aplicación
module.exports = User
