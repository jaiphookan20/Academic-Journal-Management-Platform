const {DataTypes}  = require('sequelize');
const sequelize = require("./db.js");

const Manuscript_Comment_Model = sequelize.define('manuscript_comments', 
{
    comment_id: 
    {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    file_id: DataTypes.INTEGER,
    comments : DataTypes.STRING,
    commented_by: DataTypes.INTEGER,
    comment_upload_time : DataTypes.DATE,
    visible_to_author : DataTypes.BOOLEAN
});

const Review_Model = sequelize.define('reviews', 
{
    review_id: 
    {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    submission_id: DataTypes.INTEGER,
    reviewer_id : DataTypes.INTEGER,
    confirm_to_editor: DataTypes.INTEGER,
    outcome_recommendation : DataTypes.INTEGER,
    target_date: DataTypes.DATE,
    revision_review: DataTypes.BOOLEAN,
    review_comments_editor: DataTypes.STRING,
    review_comments_author: DataTypes.STRING,
    review_time: DataTypes.DATE
});

const Outcome_Model = sequelize.define('outcomes', {
    outcome_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    outcome_name: DataTypes.TEXT(50),
    description: DataTypes.TEXT(250),
})

module.exports =  {Manuscript_Comment_Model, Review_Model, Outcome_Model};