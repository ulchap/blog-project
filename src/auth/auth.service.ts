import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/types/types';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(email);
    if (!user) throw new UnauthorizedException('This user does not exist');
    const passwordIsMatch = await argon2.verify(user.password, pass);

    if (user && passwordIsMatch) {
      return user;
    }
    throw new UnauthorizedException('Password and/or email are incorrect');
  }

  async login(user: IUser, res: Response) {
    const findUser = await this.userService.findOne(user.email);
    if (!findUser) {
      throw new UnauthorizedException('User not found');
    }
    const { id, email, role } = findUser;
    const token = this.jwtService.sign({
      id,
      email,
      role,
    });

    res.cookie('access_token', token, {
      maxAge: this.configService.getOrThrow('COOKIE_MAX_AGE'),
      sameSite: 'strict',
      secure: false, //change
      httpOnly: true,
    });

    return {
      user,
      access_token: token,
    };
  }

  googleLogin(user: IUser, res: Response) {
    try {
      const token = this.jwtService.sign({ id: user.id, email: user.email });
      res.cookie('access_token', token, {
        maxAge: this.configService.getOrThrow('COOKIE_MAX_AGE'),
        sameSite: 'strict',
        secure: false, //change
        httpOnly: true,
      });
      return { user, token };
    } catch {
      throw new HttpException(
        'Token creation error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  logout(res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // change
    });

    return { message: 'Logout successful' };
  }
}
