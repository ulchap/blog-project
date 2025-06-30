import {
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as argon2 from 'argon2';
import { IUser } from 'src/types/types';
import { Response } from 'express';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: { findOne: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeAll(() => {
    userService = { findOne: jest.fn() };
    jwtService = { sign: jest.fn() };
    authService = new AuthService(userService as any, jwtService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const pass = 'plaintext';
    const fakeUser = { id: 1, email, password: 'hashed', role: 'user' };

    it('throws if user not found', async () => {
      userService.findOne.mockResolvedValue(null);
      await expect(authService.validateUser(email, pass)).rejects.toThrow(
        new UnauthorizedException('This user does not exist'),
      );
      expect(userService.findOne).toHaveBeenCalledWith(email);
    });

    it('throws if password does not match', async () => {
      userService.findOne.mockResolvedValue(fakeUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);
      await expect(authService.validateUser(email, pass)).rejects.toThrow(
        new UnauthorizedException('Password and/or email are incorrect'),
      );
      expect(argon2.verify).toHaveBeenCalledWith(fakeUser.password, pass);
    });

    it('returns the user if password matches', async () => {
      userService.findOne.mockResolvedValue(fakeUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);
      const result = await authService.validateUser(email, pass);
      expect(result).toEqual(fakeUser);
      expect(argon2.verify).toHaveBeenCalledWith(fakeUser.password, pass);
    });
  });

  describe('login', () => {
    const userParam: IUser = { id: '2', email: 'u@example.com', role: 'user' };
    const findUser = { ...userParam };
    const token = 'jwt_token';
    let res: Partial<Response>;

    beforeEach(() => {
      res = { cookie: jest.fn() };
    });

    it('throws if userService.findOne returns null', async () => {
      userService.findOne.mockResolvedValue(null);
      await expect(authService.login(userParam, res)).rejects.toThrow(
        new UnauthorizedException('User not found'),
      );
      expect(userService.findOne).toHaveBeenCalledWith(userParam.email);
    });

    it('sets cookie and returns user+token', async () => {
      userService.findOne.mockResolvedValue(findUser);
      jwtService.sign.mockReturnValue(token);

      const result = await authService.login(userParam, res as Response);

      expect(userService.findOne).toHaveBeenCalledWith(userParam.email);
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: findUser.id,
        email: findUser.email,
        role: findUser.role,
      });
      expect(res.cookie).toHaveBeenCalledWith('access_token', token, {
        maxAge: 2592000000,
        sameSite: 'strict',
        secure: false,
        httpOnly: true,
      });
      expect(result).toEqual({
        user: userParam,
        access_token: token,
      });
    });
  });

  describe('googleLogin', () => {
    const googleUser = { id: 5, email: 'g@example.com' };
    const token = 'google_jwt';
    let res: Partial<Response>;

    beforeEach(() => {
      res = { cookie: jest.fn() };
    });

    it('sets cookie and returns user+token', async () => {
      jwtService.sign.mockReturnValue(token);

      const result = await authService.googleLogin(googleUser, res as Response);

      expect(jwtService.sign).toHaveBeenCalledWith({
        id: googleUser.id,
        email: googleUser.email,
      });
      expect(res.cookie).toHaveBeenCalledWith('access_token', token, {
        maxAge: 2592000000,
        sameSite: 'strict',
        secure: false,
        httpOnly: true,
      });
      expect(result).toEqual({ user: googleUser, token });
    });

    it('throws HttpException on sign error', async () => {
      jwtService.sign.mockImplementation(() => {
        throw new Error('fail');
      });

      await expect(
        authService.googleLogin(googleUser, res as Response),
      ).rejects.toThrow(
        new HttpException(
          'Token creation error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('logout', () => {
    it('clears cookie and returns message', async () => {
      const res = { clearCookie: jest.fn() } as any;
      const result = await authService.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('access_token', {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
      });
      expect(result).toEqual({ message: 'Logout successful' });
    });
  });
});
