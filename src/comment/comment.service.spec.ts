import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    commentRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: commentRepository,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  describe('create', () => {
    it('should create a comment and return the saved comment', async () => {
      const createCommentDto: CreateCommentDto = {
        text: 'Test comment',
        postId: 1,
      };

      const userId = 42;
      const savedComment = {
        id: 1,
        text: createCommentDto.text,
        postId: 1,
        user: { id: userId },
      };

      commentRepository.save.mockResolvedValue(savedComment);

      const result = await service.create(createCommentDto, userId);

      expect(commentRepository.save).toHaveBeenCalledWith({
        text: createCommentDto.text,
        postId: 1,
        user: { id: userId },
      });
      expect(result).toEqual(savedComment);
    });
  });

  describe('findAll', () => {
    it('should return an array of comments for a given postId', async () => {
      const postId = 1;
      const comments = [
        { id: 1, text: 'Comment 1', postId, user: { id: 2 } },
        { id: 2, text: 'Comment 2', postId, user: { id: 3 } },
      ];

      commentRepository.find.mockResolvedValue(comments);

      const result = await service.findAll(postId);

      expect(commentRepository.find).toHaveBeenCalledWith({
        where: { post: { id: postId } },
        relations: ['user', 'post'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(comments);
    });
  });

  describe('findOne', () => {
    it('should return a comment if found', async () => {
      const commentId = 1;
      const foundComment = {
        id: commentId,
        text: 'Found comment',
        postId: 1,
        user: { id: 2 },
      };

      commentRepository.findOne.mockResolvedValue(foundComment);

      const result = await service.findOne(commentId);

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
        relations: ['user', 'post'],
      });
      expect(result).toEqual(foundComment);
    });

    it('should throw NotFoundException if comment is not found', async () => {
      const commentId = 999;
      commentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(commentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
        relations: ['user', 'post'],
      });
    });
  });

  describe('update', () => {
    const commentId = 1;
    const existingComment = {
      id: commentId,
      text: 'Old text',
      postId: 1,
      user: { id: 2 },
    };

    beforeEach(() => {
      commentRepository.findOne.mockResolvedValue(existingComment);
    });

    it('should update comment when valid update data provided and return updated comment', async () => {
      const updateData: UpdateCommentDto = {
        text: 'Updated text',
      };

      const updatedComment = { ...existingComment, ...updateData };

      commentRepository.save.mockResolvedValue(updatedComment);

      const result = await service.update(commentId, updateData);

      expect(result).toEqual(updatedComment);
      expect(commentRepository.save).toHaveBeenCalledWith(updatedComment);
    });

    it('should throw BadRequestException if update data includes post property', async () => {
      const updateData: UpdateCommentDto = {
        text: 'Updated text',
        postId: 123,
      };

      await expect(service.update(commentId, updateData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if comment to update does not exist', async () => {
      commentRepository.findOne.mockResolvedValue(null);

      const updateData: UpdateCommentDto = {
        text: 'Updated text',
      };

      await expect(service.update(commentId, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete comment if found and return delete result', async () => {
      const commentId = 1;
      const foundComment = {
        id: commentId,
        text: 'Comment',
        postId: 1,
        user: { id: 2 },
      };

      commentRepository.findOne.mockResolvedValue(foundComment);
      const deleteResult = { affected: 1 };
      commentRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.remove(commentId);

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(commentRepository.delete).toHaveBeenCalledWith(commentId);
      expect(result).toEqual(deleteResult);
    });

    it('should throw NotFoundException if comment to delete is not found', async () => {
      const commentId = 999;
      commentRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(commentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
