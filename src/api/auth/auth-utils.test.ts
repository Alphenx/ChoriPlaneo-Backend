import dotenv from 'dotenv';
import { encryptPassword } from './auth-utils.js';

describe('Given an encryptPassword function', () => {
  beforeAll(() => {
    dotenv.config();
  });

  describe('Given an ENCRYPTION_ALGORITHM and a ENCRYPTION_KEY', () => {
    beforeEach(() => {
      process.env.PASSWORD_ENCRYPTION_ALGORITHM = 'aes-256-ecb';
      process.env.PASSWORD_ENCRYPTION_KEY = 'this-is-a-secret-key';
    });

    afterEach(() => {
      delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;
      delete process.env.PASSWORD_ENCRYPTION_KEY;
    });

    test('When is called, then encrypted password should be valid and different of previous password', () => {
      const password = 'myPassword';
      const encryptedPassword = encryptPassword(password);

      expect(encryptedPassword).not.toEqual(password);
      expect(encryptedPassword).toMatch(/^[0-9a-f]+$/i);
    });

    test('When encrypting the same password twice, then it should return the same encrypted password value', () => {
      const firstEncryptedPassword = encryptPassword('passwordTest12345');
      const secondEncryptedPassword = encryptPassword('passwordTest12345');

      expect(firstEncryptedPassword).toBe(secondEncryptedPassword);
    });

    test('When the encryption algorithm is undefined, then it should throw an error', () => {
      delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;

      expect(() => {
        encryptPassword('passwordTest12345');
      }).toThrow('Encryption algorithm must be defined on env');
    });

    test('When the encryption key is undefined, then it should throw an error', () => {
      delete process.env.PASSWORD_ENCRYPTION_KEY;

      expect(() => {
        encryptPassword('passwordTest12345');
      }).toThrow('Encryption key must be defined on env');
    });
  });
});
