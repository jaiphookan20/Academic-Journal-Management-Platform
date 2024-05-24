const {DataTypes}  = require('sequelize');
const sequelize = require("../models/db.js");

//Client model
const Client_Model = sequelize.define('clients', 
{
  client_id: 
  {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username : DataTypes.STRING,
  first_name : DataTypes.STRING,
  last_name : DataTypes.STRING,
  email : DataTypes.STRING,
  institution_name : DataTypes.STRING,
  orcid: DataTypes.STRING,
  pronoun : DataTypes.STRING,
  verification_token : DataTypes.STRING,
  salt : DataTypes.STRING,
  reset_token : DataTypes.STRING,
  reset_token_expiry : DataTypes.DATE,
  password_hash : DataTypes.STRING,
  email_verified : DataTypes.TINYINT,
  createdAt: false,
  updatedAt: false
});

//Client Role model
const Client_Role_Model = sequelize.define('client_role', 
{
  client_role_id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  client_id: DataTypes.INTEGER,
  role_id: DataTypes.INTEGER
},
{
  tableName: 'client_role'
});

//Refresh Token model
const Refresh_Token_Model = sequelize.define('refresh_tokens', 
{
  token_id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  client_id: DataTypes.INTEGER,
  refresh_token: DataTypes.STRING,
  ip_address: DataTypes.STRING,
  valid_from: DataTypes.DATE,
  valid_till: DataTypes.DATE,
  revoked_at: DataTypes.DATE,
  revoked_by: DataTypes.INTEGER
});

module.exports =  {Client_Model, Client_Role_Model, Refresh_Token_Model};