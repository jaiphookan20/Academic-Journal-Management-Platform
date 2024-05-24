// Example utility function to validate password
const is_valid_password = (password) => 
{
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (passwordRegex.test(password)) return true;
  else return false;
};

// Example utility function to validate emails
const is_valid_email = (email) => 
{
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(email)) return true;
  else return false;
};

const generatePassword =() =>
{
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
  var password = "";

  // Generate one character of each type first
  password += chars.charAt(Math.floor(Math.random() * 26)); // uppercase letter
  password += chars.charAt(Math.floor(Math.random() * 26) + 26); // lowercase letter
  password += chars.charAt(Math.floor(Math.random() * 10) + 52); // number
  password += chars.charAt(Math.floor(Math.random() * 7) + 62); // special character

  // Generate remaining characters
  for (var i = 4; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
};

const is_valid_orcid = (orcid) => {
  const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
  return orcidRegex.test(orcid);
};

module.exports = {
  is_valid_password,
  is_valid_email, 
  generatePassword,
  is_valid_orcid
};
