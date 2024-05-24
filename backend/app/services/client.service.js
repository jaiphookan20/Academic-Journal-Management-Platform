const sequelize = require("../models/db.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  Client_Model,
  Client_Role_Model,
  Refresh_Token_Model,
} = require("../models/client.model.js");
const { Op, QueryTypes, where } = require("sequelize");
const roles = require("../config/roles.js");

// #region Object constructors
const Client = function (client) {
  this.username = client.username;
  this.first_name = client.first_name;
  this.last_name = client.last_name;
  this.email = client.email;
  this.institution_name = client.institution_name;
  this.orcid = client.orcid;
  this.pronoun = client.pronoun;
  this.verification_token = client.verification_token;
  this.salt = client.salt;
  this.password_hash = client.password_hash;
  this.email_verified = 0;
};

const Client_Role = function (role, res) {
  switch (role) {
    case "Author": {
      this.role_id = 3;
      break;
    }
    case "Editor": {
      this.role_id = 1;
      break;
    }
    case "Editorial Assistant": {
      this.role_id = 2;
      break;
    }
    case "Reviewer": {
      this.role_id = 4;
      break;
    }
    default: {
      this.role_id = null;
      break;
    }
  }
};

const Refresh_Token = function (token) {
  this.refresh_token = token.refresh_token;
  this.ip_address = token.ip_address;
};
// #endregion

// Client signup service
Client.signup = async (
  new_client,
  new_client_role,
  new_refresh_token,
  result
) => {
  let transaction;
  try {
    // Start a transaction
    transaction = await sequelize.transaction();

    // Perform database operations within the transaction
    const created_client = await Client_Model.create(new_client, {
      transaction,
    });
    new_client_role.client_id = created_client.dataValues.client_id;
    await Client_Role_Model.create(new_client_role, { transaction });
    new_refresh_token.client_id = created_client.dataValues.client_id;
    await Refresh_Token_Model.create(new_refresh_token, { transaction });

    // If everything is successful, commit the transaction
    await transaction.commit();
    result(null, created_client.dataValues);
  } catch (error) {
    // If an error occurs, rollback the transaction
    if (transaction) await transaction.rollback();
    result(error.original.sqlMessage, null);
  }
};

// Client validate email service
Client.validate_verification_token = (verification_token, result) => {
  // Try to find if the verfication token is valid
  Client_Model.findOne({
    where: { verification_token: verification_token },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
    .then((user) => {
      if (user) {
        // If verification token exists, verify client's email
        user.email_verified = 1;
        user.verification_token = null;
        user.save();
        result(null, {
          email: user.email,
          response: "Success. Email has been verified",
        });
      } else {
        // Otherwise send a message, that account is not found
        result("Account not found", null);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      result(error, null);
    });
};

// Provides token to client to reset his password using his email
Client.forgotPassword = async (email, result) => {
  // Generate a random token for password reset
  const token = crypto.randomBytes(20).toString("hex");

  // Set the expiration time for the reset token (1 hour from now)
  const expiration = new Date(Date.now() + 3600000);

  // Try to find if the provided email is valid
  Client_Model.findOne({
    where: { email: email },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
    .then(async (user) => {
      if (user) {
        // If email exists, update the client's record in the database with the reset token and expiration time
        user.reset_token = token;
        user.reset_token_expiry = expiration;
        await user.save();
        result(null, { token, email });
      } else {
        // Otherwise send a message, that account is not found
        result("Account with entered email not found", null);
      }
    })
    .catch((error) => {
      console.error("Error:", error.original.sqlMessage);
      result(error.original.sqlMessage, null);
    });
};

// Client Login service
Client.login = async (username, password, new_refresh_token, result) => {
  // Try to find if the provided email is valid
  Client_Model.findOne({
    where: { username: username },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
    .then(async (user) => {
      if (user) {
        // If email exists, validate client's password
        if (bcrypt.compareSync(password, user.password_hash)) {
          // Update user's last login time
          user.last_login = new Date(Date.now());
          await user.save();

          // Update new refresh token
          const refresh_token = new Refresh_Token(new_refresh_token);
          refresh_token.client_id = user.client_id;
          await Refresh_Token_Model.create(refresh_token);

          // Get user's role information
          Client_Role_Model.findAll({
            where: { client_id: user.client_id },
          }).then((user_roles) => {
            user.dataValues.roles = [];
            user_roles.forEach((element) => {
              console.log(element.dataValues.role_id);
              if (element)
                user.dataValues.roles.push(element.dataValues.role_id);
            });

            user.dataValues.refresh_token = new_refresh_token.refresh_token;

            result(null, user.dataValues);
          });
        } else {
          // If password does not match, send wrong password message
          result("Wrong password", null);
        }
      } else {
        // Otherwise send a message, that account is not found
        result("Username not found", null);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      result(error, null);
    });
};

// Function to complete the password reset process
Client.resetPassword = async (token, newPassword, result) => {
  // Try to find if the provided token is valid
  Client_Model.findOne({
    where: { reset_token: token, reset_token_expiry: { [Op.gt]: new Date() } },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
    .then(async (user) => {
      if (user) {
        // If token is valid, update the client's password
        user.salt = bcrypt.genSaltSync(10);
        user.password_hash = bcrypt.hashSync(newPassword, user.salt);
        user.reset_token = null;
        user.reset_token_expiry = null;
        await user.save();
        result(null, "Password reset successful");
      } else {
        // Otherwise send a message, that token is not found or expired
        result("Invalid or expired token", null);
      }
    })
    .catch((error) => {
      console.error("Error:", error.original.sqlMessage);
      result(error.original.sqlMessage, null);
    });
};

// Function to login using refresh token
Client.loginRefresh = (
  client_id,
  old_refresh_token,
  ip_address,
  new_refresh_token,
  result
) => {
  // Try to find if the provided refresh token is valid
  Refresh_Token_Model.findOne({
    where: { refresh_token: old_refresh_token },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
    .then(async (response) => {
      if (response) 
      {
        if (response.dataValues.client_id == client_id && response.dataValues.ip_address == ip_address) 
        {
          if (response.dataValues.valid_till > Date.now() && response.dataValues.revoked_at == null) 
          {
            let transaction;
            try {
              // Start a transaction
              transaction = await sequelize.transaction();

              // Creating a new refresh token
              const refresh_token = new Refresh_Token(new_refresh_token);
              refresh_token.client_id = client_id;
              const created_token = await Refresh_Token_Model.create(
                refresh_token,
                { transaction }
              );

              // Revoking old token
              response.revoked_at = Date.now();
              response.revoked_by = created_token.dataValues.token_id;
              await response.save({ transaction });

              // Updating last login time
              await Client_Model.update(
                { last_login: Date.now() },
                { where: { client_id: client_id } },
                { transaction }
              );

              // Fetching user details
              const user = await Client_Model.findOne({
                where: { client_id: client_id },
                attributes: {
                  exclude: ["createdAt", "updatedAt", "deletedAt"],
                },
              });

              // If everything is successful, commit the transaction
              await transaction.commit();

              // Fetching user role details
              Client_Role_Model.findAll({
                where: { client_id: client_id },
              }).then((user_roles) => {
                user.dataValues.roles = [];
                user_roles.forEach((element) => {
                  console.log(element.dataValues.role_id);
                  if (element)
                    user.dataValues.roles.push(element.dataValues.role_id);
                });

                user.dataValues.refresh_token = new_refresh_token.refresh_token;
                result(null, user.dataValues);
              });
            } catch (error) {
              // If an error occurs, rollback the transaction
              if (transaction) await transaction.rollback();

              result(error.original.sqlMessage, null);
            }
          } else {
            // Otherwise send a message, that token is revoked or expired
            result("Token expired or revoked", null);
          }
        }
        else
        {
          result("Invalid token. Please login with username and password again",null);
        }
      } 
      else 
      {
        // Otherwise, send a message, that token is invalid
        result("Invalid token. Please login with username and password again",null);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      result(error, null);
    });
};

// Edit account details
Client.editAccount = (
  first_name,
  last_name,
  institution_name,
  orcid,
  pronoun,
  client_id,
  result
) => {
  // Try to find if the provided client_id is valid
  Client_Model.findOne({
    where: { client_id: client_id },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
    .then(async (user) => {
      if (user) {
        // If client_id is valid, update the client's details
        if (first_name) user.first_name = first_name;
        if (last_name) user.last_name = last_name;
        if (institution_name) user.institution_name = institution_name;
        if (orcid) user.orcid = orcid;
        if (pronoun) user.pronoun = pronoun;

        await user.save();

        result(null, "Updated account details");
      } else {
        // Otherwise send a message, that account is not found
        result("Account not found", null);
      }
    })
    .catch((error) => {
      console.error("Error:", error.original.sqlMessage);
      result(error.original.sqlMessage, null);
    });
};

// Edit account email
Client.editEmail = (email, verification_token, client_id, result) => {
  // Try to find if the provided client_id is valid
  Client_Model.findOne({
    where: { client_id: client_id },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
    .then(async (user) => {
      if (user) {
        // If client_id is valid, update the client's email
        user.email = email;
        user.email_verified = 0;
        user.verification_token = verification_token;
        await user.save();

        result(
          null,
          "Updated account email succesfully! Please verify your new email to continue using the platform"
        );
      } else {
        // Otherwise send a message, that account is not found
        result("Account not found", null);
      }
    })
    .catch((error) => {
      console.error("Error:", error.original.sqlMessage);
      result(error.original.sqlMessage, null);
    });
};

// Edit account credentials
Client.editCredentials = (username, salt, password_hash, client_id, result) => {
  // Try to find if the provided client_id is valid
  Client_Model.findOne({
    where: { client_id: client_id },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
    .then(async (user) => {
      if (user) {
        // If client_id is valid, update the client's credentials
        user.username = username;
        user.salt = salt;
        user.password_hash = password_hash;
        await user.save();

        result(null, "Updated account credentials succesfully!");
      } else {
        // Otherwise send a message, that account is not found
        result("Account not found", null);
      }
    })
    .catch((error) => {
      console.error("Error:", error.original.sqlMessage);
      result(error.original.sqlMessage, null);
    });
};

// Internal signups performed by editor
Client.signupByEditor = async (new_client, new_client_role, result) => {
  let transaction;
  try {
    // Start a transaction
    transaction = await sequelize.transaction();

    // Perform database operations within the transaction
    const created_client = await Client_Model.create(new_client, {
      transaction,
    });
    new_client_role.client_id = created_client.dataValues.client_id;
    await Client_Role_Model.create(new_client_role, { transaction });

    // If everything is successful, commit the transaction
    await transaction.commit();
    result(null, "Success");
  } catch (error) {
    // If an error occurs, rollback the transaction
    if (transaction) await transaction.rollback();
    result(error.original.sqlMessage, null);
  }
};

// Getting all editors in the platform
Client.getAllEditors = async (result) => {
  try {
    // Execute raw SQL query to select from the view
    const res = await sequelize.query("SELECT * FROM vw_client_overview WHERE role_name='Editor'", {
      type: QueryTypes.SELECT
    });

    // Process the result
    result(null, res);
  } catch (error) {
    result(error, null);
  }
};

// Getting all reviewers in the platform
Client.getAllReviewers = async (result) => {
  try {
    // Execute raw SQL query to select from the view
    const res = await sequelize.query("SELECT * FROM vw_client_overview WHERE role_name='Reviewer'", {
      type: QueryTypes.SELECT
    });

    // Process the result
    result(null, res);
  } catch (error) {
    result(error, null);
  }
};

Client.addUserRole = async (client_role, result) => {
  try {

    const newUser = await Client_Model.findOne({
      where: { client_id: client_role.client_id },
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });

    if (!newUser)
      return result("User does not exist", null);
    

    const existingRole = await Client_Role_Model.findOne({
      where: { client_id: client_role.client_id, role_id: client_role.role_id},
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });

    if (existingRole) 
      return result("User already possess the role", null);

    await Client_Role_Model.create(client_role);

    result(null, 'Role added for user successfully');
  } 
  catch (error) 
  {
    result(error, null);
  }
};

Client.removeUserRole = async (client_role, result) => {
  try {
    const newUser = await Client_Model.findOne({
      where: { client_id: client_role.client_id },
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });

    if (!newUser) 
      return result("User does not exist", null);
    

    const existingRole = await Client_Role_Model.findOne({
      where: { client_id: client_role.client_id, role_id: client_role.role_id},
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });

    if (!existingRole) 
      return result("User does not possess the role", null);
    

    await Client_Role_Model.destroy({
      where: { client_id: client_role.client_id, role_id: client_role.role_id }
    });

    result(null, 'Role removed from user successfully');
  } 
  catch (error) 
  {
    result(error, null);
  }
};

Client.addUserRole = async (client_role, result) => {
  try {

    const newUser = await Client_Model.findOne({
      where: { client_id: client_role.client_id },
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });

    if (!newUser)
      return result("User does not exist", null);
    

    const existingRole = await Client_Role_Model.findOne({
      where: { client_id: client_role.client_id, role_id: client_role.role_id},
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });

    if (existingRole) 
      return result("User already possess the role", null);

    await Client_Role_Model.create(client_role);

    result(null, 'Role added for user successfully');
  } 
  catch (error) 
  {
    result(error, null);
  }
};

Client.removeUserRole = async (client_role, result) => {
  try {
    const newUser = await Client_Model.findOne({
      where: { client_id: client_role.client_id },
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });

    if (!newUser) 
      return result("User does not exist", null);
    

    const existingRole = await Client_Role_Model.findOne({
      where: { client_id: client_role.client_id, role_id: client_role.role_id},
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });

    if (!existingRole) 
      return result("User does not possess the role", null);
    

    await Client_Role_Model.destroy({
      where: { client_id: client_role.client_id, role_id: client_role.role_id }
    });

    result(null, 'Role removed from user successfully');
  } 
  catch (error) 
  {
    result(error, null);
  }
};

Client.getAllClientsByName = async (search,result) => {
  try 
  {
    search = "%"+search+"%"
    // Execute raw SQL query to select from the view
    const res = await sequelize.query("SELECT * FROM vw_client_overview WHERE first_name LIKE :search OR last_name LIKE :search", {
      type: QueryTypes.SELECT,
      replacements: {search},
    });
    
    const new_array = []
    res.forEach(element => 
    {
      let new_role = ""
      if(element.role_name == "Editor")
        new_role = 1;
      else if(element.role_name == "Editorial Assistant")
        new_role = 2;
      else if (element.role_name == "Author")
        new_role = 3;
      else
        new_role = 4;

      let found_in_new_list = -1;
      for(let i=0;i<new_array.length;i++)
        if(new_array[i].client_id == element.client_id)
        {  
          found_in_new_list = i;
          break;
        }
      
      if(found_in_new_list != -1)
        new_array[found_in_new_list].roles.push(new_role)
      else
      {
        const new_client = {client_id:element.client_id, first_name: element.first_name,last_name:element.last_name,email:element.email,roles:[new_role]};
        new_array.push(new_client);
      }
    });

    // Process the result
    result(null, new_array);
  } 
  catch (error) 
  {
    result(error, null);
  }
};
module.exports = { Client, Client_Role, Refresh_Token };
