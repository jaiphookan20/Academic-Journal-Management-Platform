const {DataTypes}  = require('sequelize');
const sequelize = require("../models/db.js");

//Submission model
const Submission_Model = sequelize.define('submissions', 
{
  submission_id: 
  {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author_id: DataTypes.INTEGER,
  submission_title: DataTypes.STRING,
  parent_submission_id: DataTypes.INTEGER,
  editor_id: DataTypes.INTEGER,
  submission_type: DataTypes.STRING,
  abstract: DataTypes.STRING,
  acknowledgements: DataTypes.STRING,
  conflict_of_interest: DataTypes.STRING,
  authors: DataTypes.STRING,
  status: DataTypes.STRING,
  outcome_id: DataTypes.INTEGER,
  comments_to_author: DataTypes.TEXT
});

const Submission_Access_Model = sequelize.define('submission_access', 
{
    access_id: 
    {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    submission_id: DataTypes.INTEGER,
    client_role_id : DataTypes.INTEGER,
    access_token : DataTypes.STRING,
    valid_from: DataTypes.DATE,
    valid_till: DataTypes.DATE
},
{
  tableName: 'submission_access'
});

const File_Model = sequelize.define('files', 
{
    file_id: 
    {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    submission_id: DataTypes.INTEGER,
    file_name : DataTypes.STRING,
    file_description : DataTypes.STRING,
    file_upload_time : DataTypes.DATE
});


module.exports =  {Submission_Model,Submission_Access_Model, File_Model};