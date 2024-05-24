// middleware/roleMiddleware.js
const config = require("../config/config.js");
const roles = require("../config/roles.js");
const jwt = require("jsonwebtoken");

function authorize_role(role_check) {
  return (req, res, next) => {
    const usertoken = req.headers.authorization;

    if (usertoken == null)
      return res.status(403).json({ error: "Token not found" });

    const token = usertoken.split(" ");
    const { success, message } = verifyAccessToken(token[1]);

    if (success) {
      const user_roles = message.role;
      const client_id = message.id;
      let valid_client = false;

      user_roles.forEach((element) => {
        role_check.forEach((roleCheckFor) => {
          if (roles[roleCheckFor] == element) {
            console.log(element);
            valid_client = true;
            res.locals.client_id = client_id;
          
          }
        });
      });
      if (valid_client)
        return next();
      //Client is not authorised
      else{
        return res.status(403).json({ error: "Unauthorized access" });
      }
    }
  }
}

function authorize() {
  return (req, res, next) => {
    const usertoken = req.headers.authorization;

    if (usertoken == null)
      return res.status(403).json({ error: "Token not found" });

    const token = usertoken.split(" ");
    const { success, message } = verifyAccessToken(token[1]);

    if (success) {
      const client_id = message.id;
      if (client_id == null)
        return res.status(403).json({ error: "Invalid token" });
      else {
        res.locals.client_id = client_id;
        next();
      }
    } else {
      console.log(message);
      return res.status(403).json({ error: message });
    }
  };
}

function verifyAccessToken(token) {
  try {
    const secret = config.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    return { success: true, message: decoded };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = { authorize, authorize_role };
