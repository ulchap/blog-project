import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';

describe('UserController', () => {
  let controller: UserController;
  let userService: { create: jest.Mock };

  beforeEach(async () => {
    userService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call userService.create with DTO and response, and return its result', async () => {
      const dto: CreateUserDto = {
        name: 'User',
        email: 'user@user.com',
        password: 'password',
        role: 'user',
      };
      const res = { cookie: jest.fn() } as unknown as Response;
      const expected = {
        user: { id: 1, name: dto.name, email: dto.email, role: 'user' },
        access_token: 'jwt_token',
      };

      userService.create.mockResolvedValue(expected);
      const result = await controller.create(dto, res);
      expect(userService.create).toHaveBeenCalledWith(dto, res);
      expect(result).toEqual(expected);
    });
  });
});
