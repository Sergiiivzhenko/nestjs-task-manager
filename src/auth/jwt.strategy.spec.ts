import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();
    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    userRepository = await module.get<UserRepository>(UserRepository);
  });
  describe('validate', () => {
    it('returns a user object', async () => {
      const name = 'TestUser';
      const user = new User();
      user.username = name;
      userRepository.findOne.mockResolvedValue(user);
      const result = await jwtStrategy.validate({ username: name });
      expect(userRepository.findOne).toHaveBeenCalledWith({ username: name });
      expect(result).toEqual(user);
    });

    it('throws an Unauthorized exception if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(jwtStrategy.validate({ username: 'test' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
