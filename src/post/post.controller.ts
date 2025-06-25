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

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  create(@Body() createPostDto: CreatePostDto, @Req() req) {
    return this.postService.create(createPostDto, +req.user.id);
  }

  @Get()
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
      filter,
      search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AuthorGuard)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AuthorGuard)
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }

  @Patch(':id/rating')
  @UseGuards(JwtAuthGuard)
  async ratePost(
    @Param('id', ParseIntPipe) postId: number,
    @Req() req,
    @Body('value', ParseIntPipe) value: number,
  ) {
    return await this.postService.ratePost(postId, +req.user.id, value);
  }

  @Get(':id/rating')
  async getRating(@Param('id', ParseIntPipe) postId: number) {
    return await this.postService.getPostRating(postId);
  }
}
