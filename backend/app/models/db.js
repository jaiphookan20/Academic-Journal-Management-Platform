const config = require("../config/config.js");
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, 
{
  host: config.HOST,
  dialect: 'mysql',
  port: config.PORT,
  define: {
    timestamps: false // Disable timestamps
  }
});

// Validate and connect to the database
sequelize
    .authenticate()
    .then(() => console.log('Successfully connected to the database!'))
    .catch((error) => console.log('Failed to connect the database:', error))

module.exports = sequelize;
