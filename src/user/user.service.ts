import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/types/types';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
      maxAge: this.configService.getOrThrow('COOKIE_MAX_AGE'),
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

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException('User is not found');

    return await this.userRepository.delete(id);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async update(current: IUser, id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (dto.name) {
      if (+current.id !== id) {
        throw new ForbiddenException(
          'You can change name only for your own profile',
        );
      }
      user.name = dto.name;
    }

    if (dto.role) {
      if (current.role !== 'admin') {
        throw new ForbiddenException('Only admin can change roles');
      }
      user.role =
        dto.role.toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.USER;
    }

    await this.userRepository.save(user);
    return user;
  }
}
