import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthorGuard } from 'src/common/guards/author.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: 201,
    description: 'Post created',
    type: CreatePostDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed or bad request' })
  create(@Body() createPostDto: CreatePostDto, @Req() req) {
    return this.postService.create(createPostDto, +req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all posts with pagination, filtering and search',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
    example: 'rating_desc',
    description: 'Sort order: date_asc, date_desc',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'keyword',
  })
  @ApiResponse({ status: 200, description: 'List of posts returned' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filter') filter?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page !== undefined ? parseInt(page) : 1;
    const limitNumber = limit !== undefined ? parseInt(limit) : 5;
    return await this.postService.findAll(
      pageNumber,
      limitNumber,
      filter as any,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Post found' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, AuthorGuard)
  @ApiOperation({ summary: 'Update an existing post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 1 })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: 200,
    description: 'Post successfully updated',
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiBadRequestResponse({ description: 'Invalid update data' })
  @ApiForbiddenResponse({
    description: 'Unauthorized or attempt to edit not your post',
  })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, AuthorGuard)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Post successfully deleted' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiForbiddenResponse({
    description: 'Unauthorized or attempt to delete not your post',
  })
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }

  @Patch(':id/rating')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Rate a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 1 })
  @ApiBody({
    schema: { properties: { value: { enum: [1, -1] } } },
  })
  @ApiResponse({ status: 200, description: 'Post rating updated' })
  @ApiBadRequestResponse({ description: 'Invalid rating value' })
  @ApiForbiddenResponse({ description: 'Unauthorized' })
  async ratePost(
    @Param('id', ParseIntPipe) postId: number,
    @Req() req,
    @Body('value', ParseIntPipe) value: number,
  ) {
    return await this.postService.ratePost(postId, +req.user.id, value);
  }

  @Get(':id/rating')
  @ApiOperation({ summary: 'Get post rating' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Rating summary returned' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  async getRating(@Param('id', ParseIntPipe) postId: number) {
    return await this.postService.getPostRating(postId);
  }
}
