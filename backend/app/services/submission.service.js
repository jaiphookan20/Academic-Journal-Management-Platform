const sequelize = require("../models/db.js");
const {Submission_Model, Submission_Access_Model, File_Model} = require('../models/submission.model.js');
const {Review_Model} = require('../models/review.model.js');
const {Client_Model, Client_Role_Model} = require('../models/client.model.js');
const { QueryTypes, Op } = require("sequelize");



// #region Object constructors
const Submission = function (submission) 
{
  this.author_id = submission.author_id;
  this.submission_title = submission.submission_title;
  this.parent_submission_id = submission.parent_submission_id;
  this.submission_type = submission.submission_type;
  this.abstract = submission.abstract;
  this.acknowledgements = submission.acknowledgements;
  this.conflict_of_interest = submission.conflict_of_interest;
  this.authors = submission.authors;
};

const Submission_Access = function (submission_access) 
{
  this.submission_id = submission_access.submission_id;
  this.client_id = submission_access.client_id;
  this.access_token = submission_access.access_token;
};

const File = function (file) 
{
  this.submission_id = file.submission_id;
  this.file_name = file.file_name;
  this.file_description = file.file_description;
};
// #endregion

// Create a new submission in the database 
Submission.create = (new_submission, result) => 
{
  // Try to find if the provided author has an orcid id
  Client_Model.findOne({
    where: {client_id: new_submission.author_id},
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt']}
  })
  .then(async (user) => 
  {
    if(new_submission.parent_submission_id)
    {
      const parent_submission = await Submission_Model.findOne({
        where: { submission_id: new_submission.parent_submission_id },
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      })
      if(!parent_submission)
        return result("Parent submission id added is not valid",null)

      if(new_submission.author_id != parent_submission.author_id)
        return result("You are not allowed to make a resubmission for this parent submission",null) 
    }

    if (user.dataValues.orcid) 
    {
      // If author has an orcid id, create the submission
      Submission_Model.create(new_submission)
      .then(async (submission) => 
      {
        if (submission) 
        {
          result(null, {submission_data : submission.dataValues, author_email: user.dataValues.email});
        } 
        else 
        {
          // Otherwise send a message, that account is not found
          result("Error when creating a submission", null);
        }
      })
      .catch(error => {
        result(error.original.sqlMessage, null);
      });
    } 
    else 
    {
      // Otherwise send a message, that account has no orcid id
      result("Author does not have an ORCID ID", null);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    result(error, null);
  });
};

// Get all latest submissions by author
Submission.getAllLatestSubmissionsByAuthor = async (author_id,result) => {
  try 
  {
    console.log(author_id,"checking");
    // Execute raw SQL query to select from the view
    const res = await sequelize.query("SELECT * FROM vw_latest_submission WHERE author_id = :author_id AND submission_id = latest_submission_id", {
      type: QueryTypes.SELECT,
      replacements: {author_id},
    });
    // Process the result
    result(null, res);
  } 
  catch (error) 
  {
    result(error, null);
  }
};

// Get all linked submissions given a submission id
Submission.getAllLinkedSubmissions = async (author_id,original_submission_id,result) => {
  try 
  {
    console.log(author_id,"checking");
    // Execute raw SQL query to select from the view
    const res = await sequelize.query("SELECT * FROM vw_original_submission WHERE original_submission_id = :original_submission_id", {
      type: QueryTypes.SELECT,
      replacements: {original_submission_id},
    });

    if(res.length > 0)
    {
      // Validates if the token owner is the acutal author of the submission
      if(res[0].author_id != author_id)
          return result("Unauthorized Access",null);
    }
    else
    {
      // If the submission does not exist
      return result("Submission does not exist",null);
    }

    // Process the result
    result(null, res);
  } 
  catch (error) 
  {
    result(error, null);
  }
};

// Get access to files in submission
Submission.getSubmissionAccess = async (new_access_token,client_id,is_review,result) => 
{
  Submission_Model.findOne({
    where: { submission_id: new_access_token.submission_id },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
  .then(async (submission) => 
  {
    if(submission)
    {
      // Check if the logged in user is a reviewer authorised to access the file
      const reviewer_check = await Review_Model.findOne({
        where: { submission_id: new_access_token.submission_id,reviewer_id : client_id, confirm_to_editor:1 },
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      })

      console.log(submission.author_id,client_id,"Checking equality",is_review);
      if(submission.author_id == client_id && is_review == "false")
      {
        const client_role = await Client_Role_Model.findOne({
          where: { client_id: client_id,role_id : 3 },
          attributes: ["client_role_id"],
        });

        if(client_role)
          new_access_token.client_role_id = client_role.client_role_id;
        else
          return result("The client does not seem to have author role",null)
      }
      else if(submission.editor_id == client_id && is_review == "false")
      {
        const client_role = await Client_Role_Model.findOne({
          where: { client_id: client_id,role_id : 1 },
          attributes: ["client_role_id"],
        });
        
        if(client_role)
          new_access_token.client_role_id = client_role.client_role_id;
        else
          return result("The client does not seem to have editor role",null)
      }
      else if (reviewer_check)
      {
          const client_role = await Client_Role_Model.findOne({
            where: { client_id: client_id,role_id : 4 },
            attributes: ["client_role_id"],
          });
          
          if(client_role)
            new_access_token.client_role_id = client_role.client_role_id;
          else
            return result("The client does not seem to have reviewer role",null)
      }
      // If not a valid user that can access the file, return Error
      else
        return result("Unauthorized access",null);

      Submission_Access_Model.create(new_access_token)
      .then((access)=>
      { 
        if(access)
          result(null,access)
        else
          result("Some error in granting access",null)
      })
      .catch((error)=>{result(error,null)})

    }
    else
    {
      result("Submission not found", null);
    }

  })
  .catch((error) => 
  {
      //console.error("Error:", error);
      result(error, null);
  });
}

// Get manuscript associated with submission
Submission.getManuscript = async (access_token,result) => 
{
  Submission_Access_Model.findOne({
    where: { access_token:access_token, valid_till: { [Op.gt]: new Date() } },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
  .then(async(token) => 
  {
    //If the token is valid try fetching the file
    if(token)
    {
      const submission = await Submission_Model.findOne({where: { submission_id: token.submission_id},attributes:["author_id"] })

      // Just need to validate if the manuscript file has been uploaded properly
      File_Model.findOne({
        where: { submission_id: token.submission_id,file_description : "Anonymised Manuscript" },
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      })
      .then(async (file) => 
      {
        if(file)
          result(null,`../../../data/uploads/${submission.author_id}/${token.submission_id}/${file.file_name}`)      
        else
          result("Manuscript has not been uploaded for the submission",null);
      })
      .catch((error) => 
      {
            console.error("Error:", error);
            result(error, null);
      });
    }
    else
      result("Unauthorized access", null);

  })
  .catch((error) => 
  {
      console.error("Error:", error);
      result(error, null);
  });
}

// Get all files associated with submission (in a ZIP)
Submission.getAllFiles = async (access_token,result) => 
  {
    Submission_Access_Model.findOne({
      where: { access_token:access_token, valid_till: { [Op.gt]: new Date() } },
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    })
    .then(async(token) => 
    {
      //If the token is valid try fetching the file
      if(token)
      {
        const submission = await Submission_Model.findOne({where: { submission_id: token.submission_id},attributes:["author_id"] })
        result(null,`../../../data/uploads/${submission.author_id}/${token.submission_id}/submission_files.zip`)      
      }
      else
        result("Unauthorized access", null);
  
    })
    .catch((error) => 
    {
        console.error("Error:", error);
        result(error, null);
    });
  }

// Create a new file in the database 
File.create = (new_file,result) => 
{
  // Create a new file
  File_Model.create(new_file)
    .then(() => 
    {
      result(null,"File creation successfull")
    })
    .catch(error => 
    {
      result(error,null)
    });
};

// Get submissions by ID 
Submission.getSubmissionbyID = async (client_id,submission_id,result) => 
{
  Submission_Model.findOne({
    where: { submission_id: submission_id },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
  .then(async (submission) => 
  {
    if(submission)
    {
      if(submission.author_id == client_id || submission.editor_id == client_id)
        return result(null,submission)
      else
        return result("You are not authorized to get info about this submission.",null)
    }
    else
    {
      return result("Submission not found",null)
    }
  })
  .catch((error) =>
  {
    console.log(error);
    return result(error,null);
  });

};


module.exports = { Submission,Submission_Access, File};
