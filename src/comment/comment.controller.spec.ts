import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthorOrAdminGuard } from 'src/common/guards/author.or.admin.guard';

describe('CommentController', () => {
  let controller: CommentController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: service,
        },
      ],
    })
      .overrideGuard(AuthorOrAdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CommentController>(CommentController);
  });

  describe('create', () => {
    it('should call service.create with DTO and userId, and return its result', async () => {
      const dto: CreateCommentDto = {
        text: 'Hello world',
        postId: 3,
      } as any;
      const req = { user: { id: '7' } };
      const expected = {
        id: 1,
        text: dto.text,
        post: { id: 3 },
        user: { id: 7 },
      };

      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto, req);

      expect(service.create).toHaveBeenCalledWith(dto, 7);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with parsed postId and return its result', async () => {
      const postId = 5;
      const expected = [{ id: 10, text: 'x', post: { id: postId } }];
      service.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(postId);

      expect(service.findAll).toHaveBeenCalledWith(postId);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with parsed id and return its result', async () => {
      const id = '9';
      const expected = { id: +id, text: 'comment' };
      service.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(9);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should call service.update with parsed id and DTO, and return its result', async () => {
      const id = '12';
      const dto: UpdateCommentDto = { text: 'updated text' } as any;
      const expected = { id: 12, text: dto.text };
      service.update.mockResolvedValue(expected);

      const result = await controller.update(id, dto);

      expect(service.update).toHaveBeenCalledWith(12, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should call service.remove with parsed id and return its result', async () => {
      const id = '15';
      const expected = { affected: 1 };
      service.remove.mockResolvedValue(expected);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(15);
      expect(result).toEqual(expected);
    });
  });
});
