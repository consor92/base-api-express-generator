// models/user.js

const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/MySql'); // Ajusta la ruta según tu configuración

// Función para validar contraseñas
function validatePassword(password) {
  const minLength = 6;
  const maxLength = 16;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  if (password.length < minLength || password.length > maxLength) {
    throw new Error('La contraseña debe tener entre 6 y 16 caracteres.');
  }
  if (!hasUpperCase) {
    throw new Error('La contraseña debe contener al menos una letra mayúscula.');
  }
  if (!hasLowerCase) {
    throw new Error('La contraseña debe contener al menos una letra minúscula.');
  }
  if (!hasDigit) {
    throw new Error('La contraseña debe contener al menos un número.');
  }
  if (!hasSpecialChar) {
    throw new Error('La contraseña debe contener al menos un carácter especial.');
  }
}

// Función para cifrar contraseñas
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Define el modelo User
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      customValidator(value) {
        validatePassword(value);
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // Valor por defecto para el campo isActive
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Roles',
      key: 'id'
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
});

// Define la relación con el modelo Role
const Role = require('./role');
User.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role'
});

// Define la relación uno a uno con Profile
const Profile = require('./profile');
User.hasOne(Profile, {
  foreignKey: 'userId',
  as: 'profile'
});

// Hook para cifrar la contraseña antes de crear o actualizar el usuario
User.beforeCreate(async (user) => {
  user.password = await hashPassword(user.password);
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await hashPassword(user.password);
  }
});

// Método para verificar la contraseña
User.prototype.checkPassword = async function(potentialPassword) {
  if (!potentialPassword) {
    throw new Error('Password is required');
  }

  const isMatch = await bcrypt.compare(potentialPassword, this.password);
  return { isOk: isMatch, isLocked: !this.isActive };
};

module.exports = User;
