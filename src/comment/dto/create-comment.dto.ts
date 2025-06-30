import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'comment text',
    description: 'The content of the comment',
    type: String,
  })
  text: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: 'Post id to which the comment was left',
    type: Number,
  })
  postId: number;
}
