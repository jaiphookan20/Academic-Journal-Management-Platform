const jwt = require('jsonwebtoken');
const manageToken = require("../utilities/manage.token.js");

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('manage.token.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generate_jwt_token', () => {
    it('should generate a JWT token with client ID and role', () => {
      const mockToken = 'mockToken';
      jwt.sign.mockReturnValue(mockToken);

      const client_id = 'mockClientId';
      const client_role = 'mockClientRole';

      const token = manageToken.generate_jwt_token(client_id, client_role);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: client_id, role: client_role },
        expect.any(String), // You can't directly test the secret, but you can test it's being used
        { expiresIn: '15m' }
      );

      expect(token).toEqual(mockToken);
    });
  });

  describe('generate_refresh_token', () => {
    it('should generate a refresh token with IP address', () => {
      const ip_address = 'mockIPAddress';
      const token = manageToken.generate_refresh_token(ip_address);

      expect(token).toHaveProperty('refresh_token');
      expect(token.refresh_token).toHaveLength(80); // 40 bytes in hex

      expect(token).toHaveProperty('ip_address');
      expect(token.ip_address).toEqual(ip_address);
    });
  });

  describe('random_token_string', () => {
    it('should generate a random token string', () => {
      const token = manageToken.random_token_string();

      expect(token).toHaveLength(80); // 40 bytes in hex
    });
  });
});
