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

  async findAll(page: number, limit: number) {
    if (page < 0 || limit < 0) {
      throw new BadRequestException('Page or/and limit cannot be negative');
    }
    const [posts, totalCount] = await this.postRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: {
        user: true,
      },
    });
    const totalPages = Math.ceil(totalCount / limit);
    if (page > totalPages) {
      throw new BadRequestException('Current page is above totalPages');
    }

    return {
      data: posts,
      totalCount,
      currentPage: page,
      totalPages,
    };
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
    console.log(id, updatePostDto);
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
