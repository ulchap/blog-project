import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, id: number) {
    const post = {
      title: createPostDto.title,
      description: createPostDto.description,
      user: {
        id,
      },
    };
    if (!post) throw new BadRequestException('Something went wrong');
    return await this.postRepository.save(post);
  }

  async findAll() {
    return await this.postRepository.find({
      order: { createdAt: 'DESC' },
      relations: {
        user: true,
      },
    });
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: {
        user: true,
      },
    });
    if (!post) throw new NotFoundException('Post is not found');
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.postRepository.findOne({
      where: { id },
    });
    if (!post) throw new NotFoundException('Post is not found');

    return await this.postRepository.update(id, updatePostDto);
  }

  async remove(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
    });
    if (!post) throw new NotFoundException('Post is not found');

    return await this.postRepository.delete(id);
  }
}
