import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, id: number) {
    const comment = {
      text: createCommentDto.text,
      postId: createCommentDto.postId,
      user: { id },
    };
    if (!comment) throw new BadRequestException('Something went wrong');
    return await this.commentRepository.save(comment);
  }

  async findAll(postId: number) {
    return await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });
    if (!comment) {
      throw new NotFoundException('Comment is not found');
    }
    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.findOne(id);
    if (!comment) throw new NotFoundException('comment is not found');
    const updates = { ...updateCommentDto };
    if (updates.postId) {
      throw new BadRequestException('you cannot change postId');
    }
    const updatedComment = { ...comment, ...updates };

    return await this.commentRepository.save(updatedComment);
  }

  async remove(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });
    if (!comment) throw new NotFoundException('comment is not found');

    return await this.commentRepository.delete(id);
  }
}
