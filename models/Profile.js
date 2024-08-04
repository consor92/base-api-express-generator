// models/profile.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/MySql'); // Ajusta la ruta según tu configuración

// Define el modelo Profile
const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    },
    unique: true // Asegura que cada usuario tenga solo un perfil
  }
}, {
  tableName: 'profiles',
  timestamps: true,
  underscored: true,
});


// Define la relación con el modelo User
const User = require('./user'); // Asegúrate de ajustar la ruta según tu estructura de carpetas

Profile.belongsTo(User, {
  foreignKey: 'userId', // Clave foránea en el modelo Profile
  as: 'user' // Alias para la relación (opcional)
});

// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Profile;
