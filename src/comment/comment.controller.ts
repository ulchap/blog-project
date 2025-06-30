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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comment created',
    type: CreateCommentDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed or bad request' })
  create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    return this.commentService.create(createCommentDto, +req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for a post' })
  @ApiQuery({ name: 'postId', required: true, type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Comments returned',
    type: [CreateCommentDto],
  })
  @ApiBadRequestResponse({
    description: 'Missing or invalid postId query parameter',
  })
  findAll(@Query('postId') postId: number) {
    return this.commentService.findAll(+postId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Comment found',
    type: CreateCommentDto,
  })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @Resource('comment')
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, AuthorOrAdminGuard)
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID', example: 1 })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 200,
    description: 'Comment updated',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @ApiForbiddenResponse({
    description: 'Unauthorized or attempt to edit not your comment',
  })
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Resource('comment')
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, AuthorOrAdminGuard)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Comment deleted' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @ApiForbiddenResponse({
    description: 'Unauthorized or attempt to delete not your comment',
  })
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
