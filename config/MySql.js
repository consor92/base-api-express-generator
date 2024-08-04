const { Sequelize } = require('sequelize');
require('dotenv').config(); // Para cargar variables de entorno desde el archivo .env

// Configura la conexión a la base de datos SQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql', // Cambia a 'postgres' o 'sqlite' si usas otra base de datos
  logging: false,   // Cambia a `console.log` si quieres ver las consultas SQL en la consola
});

// Exporta la instancia de Sequelize
module.exports = sequelize;
