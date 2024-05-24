const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/config.js");

function generate_jwt_token(client_id,client_role) 
{
  // create a jwt token containing the account id that expires in 15 minutes
  return jwt.sign(
    { id: client_id,role:client_role },
    config.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// generate refresh token ----------------------------
function generate_refresh_token(ip_address) 
{
  // create a refresh token that expires in 7 days
  return {
    refresh_token: random_token_string(),
    ip_address: ip_address,
  };
}

function random_token_string() 
{
  return crypto.randomBytes(40).toString("hex");
}

module.exports = {
  generate_jwt_token,
  generate_refresh_token,
  random_token_string,
};
