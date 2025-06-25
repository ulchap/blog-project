import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthorOrAdminGuard } from 'src/common/guards/author.or.admin.guard';
import { Resource } from 'src/common/decorators/resource.decorator';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    return this.commentService.create(createCommentDto, +req.user.id);
  }

  @Get()
  findAll(@Query('postId') postId: number) {
    return this.commentService.findAll(+postId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @Resource('comment')
  @Patch(':id')
  @UseGuards(JwtAuthGuard, AuthorOrAdminGuard)
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Resource('comment')
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AuthorOrAdminGuard)
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
