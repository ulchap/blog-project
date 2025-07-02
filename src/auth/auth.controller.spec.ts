import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { RequestWithUser } from 'src/types/types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    login: jest.Mock;
    logout: jest.Mock;
    googleLogin: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      logout: jest.fn(),
      googleLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return its result', async () => {
      const req = {
        user: { id: 1, email: 'a@b.com', role: 'user' },
      } as unknown as RequestWithUser;
      const res = { cookie: jest.fn() } as unknown as Response;
      const expected = { user: req.user, access_token: 'jwt_token' };

      authService.login.mockResolvedValue(expected);

      const result = await controller.login(req, res);

      expect(authService.login).toHaveBeenCalledWith(req.user, res);
      expect(result).toEqual(expected);
    });
  });

  describe('getProfile', () => {
    it('should return user from request', () => {
      const user = { id: 2, email: 'c@d.com', role: 'admin' };
      const req = { user } as any;

      const result = controller.getProfile(req);
      expect(result).toEqual(user);
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return its result', async () => {
      const res = { clearCookie: jest.fn() } as unknown as Response;
      const expected = { message: 'Logout successful' };

      authService.logout.mockResolvedValue(expected);

      const result = await controller.logout(res);
      expect(authService.logout).toHaveBeenCalledWith(res);
      expect(result).toEqual(expected);
    });
  });

  describe('auth (Google OAuth redirect)', () => {
    it('should be defined and return undefined', async () => {
      const result = await controller.auth();
      expect(result).toBeUndefined();
    });
  });

  describe('googleAuthCallback', () => {
    it('should call authService.googleLogin and return its result', async () => {
      const req = {
        user: { id: 3, email: 'e@f.com' },
      } as unknown as RequestWithUser;
      const res = { cookie: jest.fn() } as unknown as Response;
      const expected = { user: req.user, token: 'google_jwt' };

      authService.googleLogin.mockResolvedValue(expected);

      const result = await controller.googleAuthCallback(req, res);
      expect(authService.googleLogin).toHaveBeenCalledWith(req.user, res);
      expect(result).toEqual(expected);
    });
  });
});
