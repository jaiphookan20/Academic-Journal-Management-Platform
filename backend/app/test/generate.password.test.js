const {generatePassword, is_valid_password} = require("../utilities/validate");

describe('generatePassword function', () => {
    test('should generate a password of length 8', () => {
      // Generate a password
      const password = generatePassword();
  
      // Check if the generated password has length 8
      expect(password.length).toBe(8);
    });
  
    test('should contain at least one uppercase letter, one lowercase letter, one number, and one special character', () => {
      // Define regex patterns to match each character type
      const uppercaseRegex = /[A-Z]/;
      const lowercaseRegex = /[a-z]/;
      const numberRegex = /[0-9]/;
      const specialCharRegex = /[@$!%*?&]/;
  
      // Generate a password
      const password = generatePassword();
      console.log(password)
  
      // Check if the generated password contains at least one uppercase letter, one lowercase letter,
      // one number, and one special character
      expect(uppercaseRegex.test(password)).toBe(true);
      expect(lowercaseRegex.test(password)).toBe(true);
      expect(numberRegex.test(password)).toBe(true);
      expect(specialCharRegex.test(password)).toBe(true);
    });

    test(`checks if generated password is valid or not.`, () => {
        const password = generatePassword();
        expect(is_valid_password(password)).toBe(true);
    });
  });