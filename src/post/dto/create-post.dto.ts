import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @MinLength(3, { message: 'The title must be at least 3 symbols' })
  @ApiProperty({
    example: 'post title',
    description: 'The title of the post',
    minLength: 3,
    type: String,
  })
  title: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'post content',
    description: 'The content of the post',
    type: String,
  })
  description: string;

  @ApiProperty({
    example: 'post keywords',
    description: 'The keywords for post (generated automatically)',
    required: false,
    type: String,
  })
  keywords?: string;
}
