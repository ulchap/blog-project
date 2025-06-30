import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'userName',
    description: 'The name of the user',
    type: String,
  })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'user@email.com',
    description: 'User email',
    type: String,
  })
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'The password must be at least 6 symbols' })
  @ApiProperty({
    example: 'password',
    description: 'User password',
    minLength: 6,
    type: String,
  })
  password: string;

  @ApiProperty({
    example: 'user',
    description: 'User role',
    required: false,
    type: String,
  })
  role: string;
}
