import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { PostService } from 'src/post/post.service';

@Injectable()
export class AuthorGuard implements CanActivate {
  constructor(private readonly postService: PostService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const id = request.params;
    const entity = await this.postService.findOne(id);
    const user = request.user;
    if (entity && user && entity.user.id === user.id) {
      return true;
    } else {
      throw new BadRequestException('You cannot update/delete this post');
    }
  }
}
