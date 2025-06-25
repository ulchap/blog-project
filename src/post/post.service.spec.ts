import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostRating } from './entities/post-rating.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdatePostDto } from './dto/update-post.dto';

const mockPostRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
};

const mockPostRatingRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('PostService', () => {
  let service: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(PostRating),
          useValue: mockPostRatingRepository,
        },
      ],
    }).compile();
    service = module.get<PostService>(PostService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post and include generated keywords', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Title',
        description: 'Test Description',
      };
      const userId = 1;
      const expectedKeywords = 'test, title, description';
      const savedPost = {
        id: 1,
        ...createPostDto,
        user: { id: userId },
        keywords: expectedKeywords,
      };

      mockPostRepository.save.mockResolvedValue(savedPost);
      const result = await service.create(createPostDto, userId);

      expect(result).toEqual(savedPost);
      expect(mockPostRepository.save).toHaveBeenCalledWith({
        title: createPostDto.title,
        description: createPostDto.description,
        user: { id: userId },
        keywords: expectedKeywords,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated posts when parameters are valid', async () => {
      const page = 1;
      const limit = 10;
      const posts = [{ id: 1, title: 'Post 1' }];
      const totalCount = 20;

      mockPostRepository.findAndCount.mockResolvedValue([posts, totalCount]);

      const result = await service.findAll(page, limit);

      expect(result).toEqual({
        data: posts,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      });
      expect(mockPostRepository.findAndCount).toHaveBeenCalled();
    });

    it('should throw BadRequestException when page or limit is negative', async () => {
      await expect(service.findAll(-1, 10)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findAll(1, -5)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when requested page is above totalPages', async () => {
      const page = 5;
      const limit = 10;
      const totalCount = 20; //totalPages=2
      mockPostRepository.findAndCount.mockResolvedValue([[], totalCount]);
      await expect(service.findAll(page, limit)).rejects.toThrow(
        BadRequestException,
      );
    });

    // it('should set filter condition when filter is provided', async () => {
    //   const page = 1;
    //   const limit = 10;
    //   const filter = 'Sample';
    //   const posts = [{ id: 1, title: 'Sample Post' }];
    //   const totalCount = 1;
    //   mockPostRepository.findAndCount.mockResolvedValue([posts, totalCount]);

    //   const result = await service.findAll(page, limit, filter);
    //   expect(mockPostRepository.findAndCount).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       where: [{ title: expect.any(Object) }],
    //     }),
    //   );
    //   expect(result).toEqual({
    //     data: posts,
    //     totalCount,
    //     currentPage: page,
    //     totalPages: Math.ceil(totalCount / limit),
    //   });
    // });

    it('should set search condition when search is provided', async () => {
      const page = 1;
      const limit = 10;
      const search = 'keyword';
      const posts = [{ id: 1, title: 'Post', keywords: 'some keyword' }];
      const totalCount = 1;
      mockPostRepository.findAndCount.mockResolvedValue([posts, totalCount]);

      const result = await service.findAll(page, limit, undefined, search);

      expect(mockPostRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [{ keywords: expect.any(Object) }],
        }),
      );
      expect(result).toEqual({
        data: posts,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      });
    });
  });

  describe('findOne', () => {
    it('should return a post when found', async () => {
      const postId = 1;
      const foundPost = { id: postId, title: 'Post 1' };
      mockPostRepository.findOne.mockResolvedValue(foundPost);

      const result = await service.findOne(postId);
      expect(result).toEqual(foundPost);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: { user: true },
      });
    });

    it('should throw NotFoundException when post is not found', async () => {
      const postId = 999;
      mockPostRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(postId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update post and recalculate keywords if title or description changed', async () => {
      const postId = 1;
      const existingPost = {
        id: postId,
        title: 'Old Title',
        description: 'Old Description',
        keywords: 'old, keywords',
      };
      mockPostRepository.findOne.mockResolvedValue(existingPost);
      mockPostRepository.update.mockResolvedValue({ affected: 1 });

      const updatePostDto: UpdatePostDto = {
        title: 'New Title',
        description: 'New Description',
      };

      const result = await service.update(postId, updatePostDto);
      expect(mockPostRepository.update).toHaveBeenCalledWith(
        postId,
        expect.objectContaining({
          title: 'New Title',
          description: 'New Description',
          keywords: 'new, title, description',
        }),
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);
      await expect(service.update(1, { title: 'xyz' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete the post if found', async () => {
      const postId = 1;
      const existingPost = { id: postId, title: 'Post' };
      mockPostRepository.findOne.mockResolvedValue(existingPost);
      mockPostRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(postId);
      expect(result).toEqual({ affected: 1 });
      expect(mockPostRepository.delete).toHaveBeenCalledWith(postId);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('ratePost', () => {
    it('should throw BadRequestException for invalid rating value', async () => {
      await expect(service.ratePost(1, 1, 2)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update rating if it exists', async () => {
      const postId = 1,
        userId = 1,
        ratingValue = -1;
      const existingRating = {
        id: 10,
        value: 1,
        post: { id: postId },
        user: { id: userId },
      };
      mockPostRatingRepository.findOne.mockResolvedValue(existingRating);
      mockPostRatingRepository.save.mockResolvedValue({
        ...existingRating,
        value: ratingValue,
      });

      const result = await service.ratePost(postId, userId, ratingValue);
      expect(mockPostRatingRepository.findOne).toHaveBeenCalledWith({
        where: { post: { id: postId }, user: { id: userId } },
      });
      expect(existingRating.value).toEqual(ratingValue);
      expect(mockPostRatingRepository.save).toHaveBeenCalledWith(
        existingRating,
      );
      expect(result.value).toEqual(ratingValue);
    });

    it('should create a rating if not exists', async () => {
      const postId = 1,
        userId = 1,
        ratingValue = 1;
      mockPostRatingRepository.findOne.mockResolvedValue(null);
      const createdRating = {
        id: 20,
        value: ratingValue,
        post: { id: postId },
        user: { id: userId },
      };
      mockPostRatingRepository.create.mockReturnValue(createdRating);
      mockPostRatingRepository.save.mockResolvedValue(createdRating);

      const result = await service.ratePost(postId, userId, ratingValue);
      expect(mockPostRatingRepository.create).toHaveBeenCalledWith({
        value: ratingValue,
        post: { id: postId },
        user: { id: userId },
      });
      expect(mockPostRatingRepository.save).toHaveBeenCalledWith(createdRating);
      expect(result).toEqual(createdRating);
    });
  });

  describe('getPostRating', () => {
    it('should return likes and dislikes counts', async () => {
      const postId = 1;
      const ratings = [{ value: 1 }, { value: -1 }, { value: 1 }];
      mockPostRatingRepository.find.mockResolvedValue(ratings);

      const result = await service.getPostRating(postId);
      expect(mockPostRatingRepository.find).toHaveBeenCalledWith({
        where: { post: { id: postId } },
      });
      expect(result).toEqual({ likes: 2, dislikes: 1 });
    });
  });
});
