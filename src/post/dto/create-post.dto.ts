import { IsNotEmpty, MinLength } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class CreatePostDto {
  @IsNotEmpty()
  @MinLength(3, { message: 'The title must be at least 3 symbols' })
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  user: User;
}
