import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostRating } from './entities/post-rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, PostRating])],
  controllers: [PostController],
  providers: [PostService, CommentService],
  exports: [PostService],
})
export class PostModule {}
