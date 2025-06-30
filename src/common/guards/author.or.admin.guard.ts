import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PostService } from 'src/post/post.service';
import { CommentService } from 'src/comment/comment.service';
import { RESOURCE_KEY } from '../decorators/resource.decorator';

@Injectable()
export class AuthorOrAdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceType = this.reflector.get<'post' | 'comment'>(
      RESOURCE_KEY,
      context.getHandler(),
    );
    const id = +request.params.id;

    if (user.role === 'admin') {
      return true;
    }

    if (resourceType === 'post') {
      const post = await this.postService.findOne(id);
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      return post.user.id === user.id;
    } else if (resourceType === 'comment') {
      const comment = await this.commentService.findOne(id);
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
      return comment.user.id === user.id;
    }
    return false;
  }
}
