// models/transaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Transaction = sequelize.define('Transaction', {
  type: {
    type: DataTypes.STRING, // 'buy' ou 'sell'
    allowNull: false
  },
  usd_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  brl_rate: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  fees: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // Novo campo:
  platform: {
    type: DataTypes.STRING, // 'Wise', 'Nomad', etc.
    allowNull: false
  }
});

module.exports = Transaction;
