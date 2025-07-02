import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostController', () => {
  let controller: PostController;
  let postService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    ratePost: jest.Mock;
    getPostRating: jest.Mock;
  };

  beforeEach(async () => {
    postService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      ratePost: jest.fn(),
      getPostRating: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: postService,
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
  });

  describe('create', () => {
    it('should call postService.create with correct parameters and return result', async () => {
      const createDto: CreatePostDto = {
        title: 'Test Post',
        description: 'Test Description',
        keywords: '',
      };
      const req = { user: { id: '1' } };
      const expectedResult = { id: 1, title: createDto.title };

      postService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, req);

      expect(postService.create).toHaveBeenCalledWith(createDto, 1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should call postService.findAll with parsed query parameters and return result', async () => {
      const page = '2';
      const limit = '10';
      const filter = 'date_desc';
      const search = 'keyword';
      const expectedResult = {
        data: [{ id: 1, title: 'Post' }],
        totalCount: 1,
        currentPage: 2,
        totalPages: 1,
      };

      postService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(page, limit, filter, search);
      expect(postService.findAll).toHaveBeenCalledWith(2, 10, filter, search);
      expect(result).toEqual(expectedResult);
    });

    it('should use default values when page and limit are not provided', async () => {
      const expectedResult = {
        data: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
      };

      postService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();
      expect(postService.findAll).toHaveBeenCalledWith(
        1,
        5,
        undefined,
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call postService.findOne with the parsed id and return the result', async () => {
      const expectedPost = { id: 1, title: 'Test Post' };
      postService.findOne.mockResolvedValue(expectedPost);

      const result = await controller.findOne('1');

      expect(postService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedPost);
    });
  });

  describe('update', () => {
    it('should call postService.update with parsed id and update data, then return result', async () => {
      const updateDto: UpdatePostDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        keywords: '',
      };
      const expectedResult = { affected: 1 };

      postService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateDto);

      expect(postService.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should call postService.remove with the parsed id and return result', async () => {
      const expectedResult = { affected: 1 };

      postService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(postService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('ratePost', () => {
    it('should call postService.ratePost with post id, user id from req, and rating value', async () => {
      const req = { user: { id: '2' } };
      const expectedResult = { id: 1, value: 1 };

      postService.ratePost.mockResolvedValue(expectedResult);
      const result = await controller.ratePost(1, req, 1);

      expect(postService.ratePost).toHaveBeenCalledWith(1, 2, 1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getRating', () => {
    it('should call postService.getPostRating with the post id and return result', async () => {
      const expectedRating = { likes: 10, dislikes: 2 };

      postService.getPostRating.mockResolvedValue(expectedRating);

      const result = await controller.getRating(1);

      expect(postService.getPostRating).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedRating);
    });
  });
});
