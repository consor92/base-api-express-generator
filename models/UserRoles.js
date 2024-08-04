// models/userRole.js (Tabla intermedia)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/MySql');

const UserRole = sequelize.define('UserRole', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Role',
      key: 'id'
    }
  }
}, {
  tableName: 'user_roles',
  timestamps: false
});



const User = require('./User'); // Importa el modelo User

// En models/user.js
User.belongsToMany(Role, { through: 'UserRole', as: 'roles', foreignKey: 'userId' });

const Role = require('./Roles'); // Importa el modelo User

// En models/role.js
Role.belongsToMany(User, { through: 'UserRole', as: 'users', foreignKey: 'roleId' });



module.exports = UserRole;