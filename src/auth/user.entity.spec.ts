import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

describe('UserEntity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.password = 'testPassword';
    user.salt = 'testSalt';
    bcrypt.hash = jest.fn();
  });

  describe('validatePassword', () => {
    it('returns true if password is valid', async () => {
      bcrypt.hash.mockReturnValue(user.password);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const password = '12312331';
      const result = await user.validatePassword(password);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, user.salt);
      expect(result).toEqual(true);
    });

    it('returns false if password is invalid', async () => {
      const wrongPassword = 'wrongPassword';
      bcrypt.hash.mockReturnValue(wrongPassword);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword(wrongPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(wrongPassword, user.salt);
      expect(result).toEqual(false);
    });
  });
});
