import { IsNotEmpty, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @MinLength(3, { message: 'The title must be at least 3 symbols' })
  title: string;

  @IsNotEmpty()
  description: string;
}
