import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto, res) {
    const existUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (existUser)
      throw new BadRequestException('User with this email already exists');
    let role;
    if (createUserDto.role) {
      role =
        createUserDto.role.toLowerCase() === 'admin'
          ? UserRole.ADMIN
          : UserRole.USER;
    } else {
      role = UserRole.USER;
    }
    const user = await this.userRepository.save({
      name: createUserDto.name,
      email: createUserDto.email.toLowerCase(),
      password: await argon2.hash(createUserDto.password),
      role,
    });

    const access_token = this.jwtService.sign({
      id: user.id,
      email: createUserDto.email,
      role,
    });
    res.cookie('access_token', access_token, {
      maxAge: 2592000000,
      sameSite: 'strict',
      secure: false, //change
      httpOnly: true,
    });

    return { user, access_token };
  }

  async findOne(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'password', 'role'],
    });
  }
}
