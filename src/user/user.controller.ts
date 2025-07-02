import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Res,
  Delete,
  UseGuards,
  Param,
  Get,
  Patch,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestWithUser } from 'src/types/types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully registered and token issued',
    schema: {
      example: {
        user: {
          id: 1,
          name: 'userName',
          email: 'user@email.com',
          role: 'user',
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or user with this email already exists',
  })
  create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.create(createUserDto, res);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
  })
  @ApiResponse({ status: 200, description: 'List of users returned' })
  async findAll() {
    return await this.userService.findAll();
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete a user(only for admin available' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({
    description: 'Unauthorized or attempt to delete not from admin',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile or role' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: CreateUserDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden: insufficient privileges' })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    return this.userService.update(req.user, id, dto);
  }
}
