import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PostService } from 'src/post/post.service';

@Injectable()
export class AuthorGuard implements CanActivate {
  constructor(private readonly postService: PostService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;
    const entity = await this.postService.findOne(id);
    const user = request.user;
    if (entity && user && entity.user.id === user.id) {
      return true;
    } else {
      throw new ForbiddenException('You cannot update/delete this post');
    }
  }
}
