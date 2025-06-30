import { IsNotEmpty } from 'class-validator';
import { Post } from 'src/post/entities/post.entity';

export class CreateCommentDto {
  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  postId: number;
}
