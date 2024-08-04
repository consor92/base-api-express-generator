// models/role.js

const { DataTypes } = require('sequelize'); // Importa los tipos de datos de Sequelize
const sequelize = require('../config/MySql'); // Importa la instancia de Sequelize

// Define el modelo Rol
const Roles = sequelize.define('Roles', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true // Define 'id' como clave primaria y auto-incremental
  },
  name: {
    type: DataTypes.STRING,
    unique: true, // Asegura que 'name' sea único
    allowNull: false // No permite valores nulos en 'name'
  }
}, {
  tableName: 'roles', // Nombre de la tabla en la base de datos
  timestamps: false, // Desactiva los timestamps para este modelo
  underscored: true // Usa nombres de columna en estilo snake_case
});


const User = require('./user'); // Importa el modelo User

Role.hasMany(User, { //Relación Muchos a Muchos
  foreignKey: 'roleId', // Clave foránea en el modelo User
  as: 'users' // Alias para la relación (opcional)
});


// Exporta el modelo para su uso en otras partes de la aplicación
module.exports = Roles;
