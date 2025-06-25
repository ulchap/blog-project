import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRating } from './entities/post-rating.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(PostRating)
    private readonly postRatingRepository: Repository<PostRating>,
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

  async findAll(page: number, limit: number, filter?: string) {
    if (page < 0 || limit < 0) {
      throw new BadRequestException('Page or/and limit cannot be negative');
    }

    const queryOptions: FindManyOptions<Post> = {
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: {
        user: true,
      },
    };

    if (filter) {
      queryOptions.where = [{ title: ILike(`%${filter}%`) }];
    }

    const [posts, totalCount] =
      await this.postRepository.findAndCount(queryOptions);
    const totalPages =
      Math.ceil(totalCount / limit) === 0 ? 1 : Math.ceil(totalCount / limit);
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

  async ratePost(postId: number, userId: number, value: number) {
    if (![1, -1].includes(value)) {
      throw new BadRequestException('Invalid rating value');
    }
    let rating = await this.postRatingRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });

    if (rating) {
      rating.value = value;
    } else {
      rating = this.postRatingRepository.create({
        value,
        post: { id: postId } as any,
        user: { id: userId } as any,
      });
    }

    return await this.postRatingRepository.save(rating);
  }

  async getPostRating(postId: number) {
    const ratings = await this.postRatingRepository.find({
      where: { post: { id: postId } },
    });
    const likes = ratings.filter((r) => r.value === 1).length;
    const dislikes = ratings.filter((r) => r.value === -1).length;
    return { likes, dislikes };
  }
}
