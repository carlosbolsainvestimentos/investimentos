// models/index.js
// Configuração inicial do Sequelize com SQLite
const { Sequelize } = require('sequelize');

// Usando SQLite localmente:
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

module.exports = sequelize;
