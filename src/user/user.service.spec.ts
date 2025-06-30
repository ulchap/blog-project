import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let usersRepo: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let jwtService: { sign: jest.Mock };
  let configService: { getOrThrow: jest.Mock };

  beforeEach(async () => {
    usersRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    configService = {
      getOrThrow: jest.fn(),
    };
    jest.spyOn(argon2, 'hash').mockResolvedValue('hashed_pwd');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: usersRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    const dto: CreateUserDto = {
      name: 'User',
      email: 'user@user.com',
      password: 'password',
      role: 'undefined',
    };

    it('should throw if user already exists', async () => {
      usersRepo.findOne!.mockResolvedValue({} as User);
      await expect(service.create(dto, {} as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
    });

    it('should create and return user + token, set cookie', async () => {
      usersRepo.findOne!.mockResolvedValue(null);
      usersRepo.save!.mockResolvedValue({
        id: 10,
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: 'hashed_pwd',
        role: UserRole.USER,
      } as User);

      jwtService.sign.mockReturnValue('jwt_token');
      configService.getOrThrow.mockReturnValue(123456);
      const res = { cookie: jest.fn() } as any;
      const result = await service.create(dto, res);

      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(argon2.hash).toHaveBeenCalledWith(dto.password);
      expect(usersRepo.save).toHaveBeenCalledWith({
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: 'hashed_pwd',
        role: UserRole.USER,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: 10,
        email: dto.email,
        role: UserRole.USER,
      });
      expect(configService.getOrThrow).toHaveBeenCalledWith('COOKIE_MAX_AGE');
      expect(res.cookie).toHaveBeenCalledWith('access_token', 'jwt_token', {
        maxAge: 123456,
        sameSite: 'strict',
        secure: false,
        httpOnly: true,
      });
      expect(result).toEqual({
        user: expect.objectContaining({
          id: 10,
          email: dto.email.toLowerCase(),
        }),
        access_token: 'jwt_token',
      });
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      const email = 'user@user.com';
      const user = { id: 5, email } as User;
      usersRepo.findOne!.mockResolvedValue(user);

      const result = await service.findOne(email);

      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'email', 'name', 'password', 'role'],
      });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      usersRepo.findOne!.mockResolvedValue(null);
      const result = await service.findOne('user@user.com');
      expect(result).toBeNull();
    });
  });
});
