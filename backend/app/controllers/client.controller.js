const {
  Client,
  Client_Role,
  Refresh_Token,
} = require("../services/client.service.js");

const config = require("../config/config.js");
const bcrypt = require("bcrypt");
const salt_rounds = 10;

const {
  is_valid_password,
  is_valid_email,
  generatePassword,
  is_valid_orcid,
} = require("../utilities/validate.js");

const { send_email } = require("../utilities/email.js");

const {
  generate_jwt_token,
  generate_refresh_token,
  random_token_string,
} = require("../utilities/manage.token.js");

// Create a new client - signup process
async function signup(req, res) {
  // Validate request
  if (!req.body) {
    res.status(400).json({ error: "Content can not be empty." });
    return;
  }

  if (!req.body.username || req.body.username == "")
    return res.status(400).json({ error: "Username is mandatory" });
  if (!req.body.first_name || req.body.first_name == "")
    return res.status(400).json({ error: "First name is mandatory" });
  if (!req.body.last_name || req.body.last_name == "")
    return res.status(400).json({ error: "Last name is mandatory" });
  if (!req.body.institution_name || req.body.institution_name == "")
    return res.status(400).json({ error: "Institution name is mandatory" });
  if(!req.body.orcid || req.body.orcid == '')
    return res.status(400).json({'error':'Orcid is mandatory for author signups'});
  if (!req.body.password || req.body.password == "")
    return res.status(400).json({ error: "Password is mandatory for signups" });
  if (
    req.body.pronoun != "he/him" &&
    req.body.pronoun != "she/her" &&
    req.body.pronoun != "they/them" &&
    req.body.pronoun != "other"
  )
    return res.status(400).json({ error: "Invalid pronoun" });

  // Password validation
  const password = req.body.password;

  if (!is_valid_password(password)) {
    return res.status(400).json({
      error:
        "Password should be atleast 8 characters long. Should contain one number, one small alphabet, one capital alphabet and a special character.",
    });
  }
  // Email validation
  if (!is_valid_email(req.body.email)) {
    return res.status(400).json({
      error: "Email Address is invalid. Please enter a valid Email Address.",
    });
  }

  // ORCiD validation
  const orcid = req.body.orcid;
  if(!is_valid_orcid(orcid))
    return res.status(400).json({error: "ORCiD is invalid. Please enter a valid ORCiD"})

  // Password hashing
  const salt = bcrypt.genSaltSync(salt_rounds);
  const password_hash = await bcrypt.hashSync(password, salt);

  // Create a Client
  const client = new Client({
    username: req.body.username,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    institution_name: req.body.institution_name,
    orcid: req.body.orcid,
    pronoun: req.body.pronoun,
    verification_token: random_token_string(),
    salt: salt,
    password_hash: password_hash,
  });

  const client_role = new Client_Role("Author");
  if (client_role.role_id == null)
    return res.status(400).json({ error: "Invalid role" });

  const ip_address = req.ip;
  const new_refresh_token = generate_refresh_token(ip_address);
  const refresh_token = new Refresh_Token(new_refresh_token);

  const origin = req.get("host");
  const verifyUrl = `http://${origin}/client/verify-email/${client.verification_token}`;
  var message = `<p>Please click the below link to verify your email address:</p>
             <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  // Save Client in the database

  Client.signup(client, client_role, refresh_token, (err, data) => {
    if (err) {
      const message = err || "Some error occurred while creating the Client.";
      return res.status(500).json({ error: message });
    } else {
      send_email(
        client.email,
        "Sign-up Verification API - Verify Email",
        `<h4>Verify Email</h4><br><p>Thanks for registering!</p><br>${message}`
      );

      delete data.password_hash;
      delete data.verification_token;
      delete data.salt;
      delete data.reset_token;
      delete data.reset_token_expiry;

      data.refresh_token = refresh_token.refresh_token;
      data.roles = [client_role.role_id];
      data.jwt_token = generate_jwt_token(data.client_id, data.roles);

      res.send(data);
    }
  });
}

// VerifyEmail - sending token for mail comfirmation
async function verifyEmail(req, res) {
  var verification_token = req.params.token;
  // Validate Client email

  Client.validate_verification_token(verification_token, (err, data) => {
    if (err) {
      const message =
        err || "Some error occurred while trying to verify email.";
      res.status(500).json({ error: message });
      return;
    } else {
      res.send(data.response);
      send_email(
        data.email,
        "Email Verification Complete",
        `<h4>Congratulations!</h4><br><p>Your email has been verified. You can start using the platform</p>`
      );
    }
  });
}

// Login function
async function login(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const ip_address = req.ip;
  const new_refresh_token = generate_refresh_token(ip_address);

  Client.login(username, password, new_refresh_token, (err, data) => {
    if (err) {
      const message = err || "Some error occurred while trying to login.";
      res.status(400).json({ error: message });
      return;
    } else {
      delete data.password_hash;
      delete data.verification_token;
      delete data.salt;
      delete data.reset_token;
      delete data.reset_token_expiry;

      data.jwt_token = generate_jwt_token(data.client_id, data.roles);
      res.send(data);
    }
  });
}

// Refresh Login Authentication
async function loginRefresh(req, res) {
  const client_id = req.body.client_id;
  const refresh_token = req.body.refresh_token;

  const ip_address = req.ip;
  const new_refresh_token = generate_refresh_token(ip_address);

  Client.loginRefresh(
    client_id,
    refresh_token,
    ip_address,
    new_refresh_token,
    (err, data) => {
      if (err) {
        const message = err || "Some error occurred while trying to login.";
        res.status(400).json({ error: message });
        return;
      } else {
        data.jwt_token = generate_jwt_token(data.client_id, data.roles);

        delete data.password_hash;
        delete data.verification_token;
        delete data.salt;
        delete data.reset_token;
        delete data.reset_token_expiry;

        res.send(data);
      }
    }
  );
}

// Initiate the password reset process
async function forgotPassword(req, res) {
  const email = req.body.email;

  //If email does not exist
  if (!email) return res.status(400).json({ error: "Email is mandatory" });

  // Email validation
  if (!is_valid_email(email)) {
    return res.status(400).json({
      error: "Email Address is invalid. Please enter a valid Email Address.",
    });
  }

  Client.forgotPassword(email, async (forgotErr, data) => {
    if (forgotErr) {
      res.status(500).json({ error: forgotErr });
      return;
    }

    const resetPasswordURL = `http://${config.S3_BUCKET}.s3-website-ap-southeast-2.amazonaws.com/reset-password/${data.token}`;
    const emailSubject = "SILA Password Reset";
    const emailHTML = `
      <p>You requested a password reset. Please click on the link below to reset your password:</p>
      <p><a href="${resetPasswordURL}">${resetPasswordURL}</a></p>
      <p>If you did not request a password reset, please ignore this email.</p>`;

    try {
      await send_email(email, emailSubject, emailHTML);
      res.send({ message: "Password reset email sent." });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      res.status(500).json({ error: "Failed to send password reset email." });
    }
  });
}

// Complete the password reset process with the token received in the mail
async function resetPassword(req, res) {
  // Get the token from the request parameters
  const { token } = req.params;
  const { password } = req.body;

  // Validate the password format

  if (!is_valid_password(password)) {
    res.status(400).json({
      error:
        "Password should be atleast 8 characters long. Should contain one number, one small alphabet, one capital alphabet and a special character",
    });
    return;
  }

  // Call the resetPasswordFinalize method from the Client model

  Client.resetPassword(token, password, (err) => {
    // If there's an error, send a 500 status response with the error message
    if (err) {
      res.status(500).json({ error: err });
      return;
    }

    // If the password reset is successful, send a success message
    res.send({ message: "Password reset successful" });
  });
}

// Edit account details
async function editAccount(req, res) {
  if (req.body.first_name == "")
    return res.status(400).json({ error: "First name is mandatory" });
  if (req.body.last_name == "")
    return res.status(400).json({ error: "Last name is mandatory" });
  if (req.body.institution_name == "")
    return res.status(400).json({ error: "Institution name is mandatory" });
  if (req.body.orcid == "")
    return res.status(400).json({ error: "Orcid is mandatory" });
  
  if (
    req.body.pronoun &&
    req.body.pronoun != "he/him" &&
    req.body.pronoun != "she/her" &&
    req.body.pronoun != "they/them" &&
    req.body.pronoun != "other"
  )
    return res.status(400).json({ error: "Invalid pronoun" });

  const client_id = res.locals.client_id;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const orcid = req.body.orcid;
  const institution_name = req.body.institution_name;
  const pronoun = req.body.pronoun;


  // ORCiD validation
  if(!is_valid_orcid(orcid))
    return res.status(400).json({error: "ORCiD is invalid. Please enter a valid ORCiD"});

  Client.editAccount(
    first_name,
    last_name,
    institution_name,
    orcid,
    pronoun,
    client_id,
    (err, message) => {
      if (err) {
        const message =
          err || "Some error occurred while trying to update account details.";
        res.status(400).json({ error: message });
        return;
      } else {
        res.status(200).json({ message: message });
      }
    }
  );
}

// Edit account email
async function editEmail(req, res) {
  const client_id = res.locals.client_id;
  const email = req.body.email;

  // Email validation
  if (!is_valid_email(req.body.email)) {
    return res.status(400).json({
      error: "Email Address is invalid. Please enter a valid Email Address.",
    });
  }

  const verification_token = random_token_string();
  const origin = req.get("host");
  const verifyUrl = `http://${origin}/client/verify-email/${verification_token}`;
  var htmlMessage = `<p>Please click the below link to verify your email address:</p>
             <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;

  Client.editEmail(
    email,
    verification_token,
    client_id,
    async (err, message) => {
      if (err) {
        const message =
          err || "Some error occurred while trying to update email.";
        res.status(400).json({ error: message });
        return;
      } else {
        try {
          await send_email(
            email,
            "Email update - Verify new email",
            `<h4>Verify Email</h4><br><p>Thanks for updating your current email address!</p><br>${htmlMessage}`
          );

          res.status(200).json({ message: message });
        } catch (error) {
          res.status(500).json({
            error: "Password reset successful. But failed to send verify email",
          });
        }
      }
    }
  );
}

// Edit account credentials
async function editCredentials(req, res) {
  const client_id = res.locals.client_id;
  const username = req.body.username;
  const password = req.body.password;

  if (!username || username == "")
    return res.status(400).json({ error: "Username is mandatory" });

  if (!is_valid_password(password)) {
    return res.status(400).json({
      error:
        "Password should be atleast 8 characters long. Should contain one number, one small alphabet, one capital alphabet and a special character.",
    });
  }

  // Password hashing
  const salt = bcrypt.genSaltSync(salt_rounds);
  const password_hash = await bcrypt.hashSync(password, salt);

  Client.editCredentials(
    username,
    salt,
    password_hash,
    client_id,
    (err, message) => {
      if (err) {
        const message =
          err || "Some error occurred while trying to update account details.";
        res.status(400).json({ error: message });
        return;
      } else {
        res.status(200).json({ message: message });
      }
    }
  );
}

// Create a new client - done by editor
async function signupByEditor(req, res) {
  // Validate request
  if (!req.body) {
    res.status(400).json({ error: "Content can not be empty." });
    return;
  }

  const role = req.params.role;

  if (!req.body.username || req.body.username == "")
    return res.status(400).json({ error: "Username is mandatory" });
  if (!req.body.first_name || req.body.first_name == "")
    return res.status(400).json({ error: "First name is mandatory" });
  if (!req.body.last_name || req.body.last_name == "")
    return res.status(400).json({ error: "Last name is mandatory" });
  if (!req.body.institution_name || req.body.institution_name == "")
    return res.status(400).json({ error: "Institution name is mandatory" });
  if((!req.body.orcid || req.body.orcid == "") && (role === "Author"))
    return res.status(400).json({error:'Orcid is mandatory for author'}); 
  if((!is_valid_orcid(req.body.orcid) && (role === "Author")) || (req.body.orcid && !is_valid_orcid(req.body.orcid)))
    return res.status(400).json({error: "ORCiD is invalid. Please enter a valid ORCiD"});
  if (
    req.body.pronoun != "he/him" &&
    req.body.pronoun != "she/her" &&
    req.body.pronoun != "they/them" &&
    req.body.pronoun != "other"
  )
    return res.status(400).json({ error: "Invalid pronoun" });

  // Password validation
  const password = generatePassword();

  // Email validation
  if (!is_valid_email(req.body.email)) {
    return res.status(400).json({
      error: "Email Address is invalid. Please enter a valid Email Address.",
    });
  }

  // Password hashing
  const salt = bcrypt.genSaltSync(salt_rounds);
  const password_hash = await bcrypt.hashSync(password, salt);

  // Create a Client
  const client = new Client({
    username: req.body.username,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    institution_name: req.body.institution_name,
    orcid: req.body.orcid,
    pronoun: req.body.pronoun,
    verification_token: random_token_string(),
    salt: salt,
    password_hash: password_hash,
  });

  const client_role = new Client_Role(role);
  if (client_role.role_id == null)
    return res.status(400).json({ error: "Invalid role" });

  const origin = req.get("host");
  const verifyUrl = `http://${origin}/client/verify-email/${client.verification_token}`;
  var message = `<p>Please click the below link to verify your email address:</p>
             <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  // Save Client in the database

  Client.signupByEditor(client, client_role, (err, data) => {
    if (err) {
      const message = err || "Some error occurred while creating the Client.";
      return res.status(500).json({ error: message });
    } else {
      send_email(
        client.email,
        "Signup confimation",
        `<p>You have been successfully registered as ${role}</p><br>
             <p>Please use username: ${client.username} and password: ${password} for logging in</p><br>
             <p>These are temporary credentials and you can reset them after logging in</p><br>
             <h4>Verify Email</h4><br>${message}`
      );

      return res.status(200).json({ message: `${role} successfully created` });
    }
  });
}

// Retrieve all Editors -> done by Editor and Editorial Assistants
async function getAllEditors(req, res) {
  Client.getAllEditors((err, message) => {
    if (err) {
      const message =
        err || "Some error occurred while trying to retrieve all editors.";
      res.status(400).json({ error: message });
      return;
    } else {
      console.log(message);
      res.status(200).send(message);
    }
  });
}


// Retrieve all Reviewers -> done by Editors
async function getAllReviewers(req, res) {
  Client.getAllReviewers((err, message) => {
    if (err) {
      const message =
        err || "Some error occurred while trying to retrieve all reviewers.";
      res.status(400).json({ error: message });
      return;
    } else {
      console.log(message);
      res.status(200).send(message);
    }
  });
}

async function getAllClientsByName(req, res) 
{
  const searchTerm = req.params.search;
  if (!req.params.search || req.params.search == "")
    return res.status(400).json({error: "Search term is mandatory in params"});

  Client.getAllClientsByName(searchTerm,(err, message) => 
  {
    if (err) 
    {
      const message =
        err || "Some error occurred while trying to retrieve all reviewers.";
      res.status(400).json({ error: message });
      return;
    } 
    else 
    {
      res.status(200).send(message);
    }
  });
}

async function addUserRole(req, res) 
{
  if (!req.body) {
    res.status(400).json({ error: "Content can not be empty." });
    return;
  }

  const newUserId=req.body.newUserId;
  const role = req.body.role;

  if (newUserId == "" || role == "")
    return res.status(400).json({ error: "ClientID of New User and Role to assign is mandatory" });

  if (newUserId == undefined || role == undefined)
    return res.status(400).json({ error: "Invalid ClientID of New User or Invalid Role" });

  if(role != "Author" && role != "Editor" && role != "Editorial Assistant" && role != "Reviewer") {
    return res.status(400).json({error:'Invalid Role Provided. Only valid roles include: Editor, Editorial Assistant, Reviewer'}); 
  }

  const client_role = new Client_Role(role);
  client_role.client_id = newUserId;

  Client.addUserRole(client_role, (err, message) => {
    if (err) {
      const message =
        err || "Some error occurred while trying to add role to user.";
      res.status(400).json({ error: message });
      return;
    } else {
      res.status(200).json({message: message});
    }
  });
}

async function removeUserRole(req, res) 
{
  if (!req.body) {
    res.status(400).json({ error: "Content can not be empty." });
    return;
  }

  const userId=req.body.userId;
  const role = req.body.role;

  if (userId == "" || role == "")
    return res.status(400).json({ error: "ClientID of New User and Role to assign is mandatory" });

  if (userId == undefined || role == undefined)
    return res.status(400).json({ error: "Invalid ClientID of New User or Invalid Role" });

  if(role != "Author" && role != "Editor" && role != "Editorial Assistant" && role != "Reviewer") {
    return res.status(400).json({error:'Invalid Role Provided. Only valid roles include: Editor, Editorial Assistant, Reviewer'}); 
  }

  const client_role = new Client_Role(role);
  client_role.client_id = userId;

  Client.removeUserRole(client_role, (err, message) => {
    if (err) {
      const message =
        err || "Some error occurred while trying to add role to user.";
      res.status(400).json({ error: message });
      return;
    } else {
      res.status(200).json({message: message});
    }
  });
}

module.exports = {
  signup,
  verifyEmail,
  login,
  loginRefresh,
  forgotPassword,
  resetPassword,
  editAccount,
  editEmail,
  editCredentials,
  signupByEditor,
  getAllEditors,
  getAllReviewers,
  getAllClientsByName,
  addUserRole,
  removeUserRole
};
