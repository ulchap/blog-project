import { AuthService } from './auth.service';
import { Controller, Post, UseGuards, Request, Get, Res } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@email.com' },
        password: { type: 'string', example: 'password' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, sets cookie and returns user + token',
    schema: {
      example: {
        user: { id: 1, email: 'user@example.com', role: 'user' },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the JWT-authenticated user object',
    schema: {
      example: { id: 1, email: 'user@email.com', role: 'user' },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout user (clear auth cookie)' })
  @ApiResponse({
    status: 200,
    description: 'Cookie cleared, user logged out',
    schema: { example: { message: 'Logout successful' } },
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Initiate Google login' })
  @ApiFoundResponse({ description: 'Redirects to Google OAuth consent screen' })
  async auth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Google OAuth callback endpoint' })
  @ApiResponse({
    status: 200,
    description:
      'Google login successful, sets cookie and returns user + token',
    schema: {
      example: {
        user: { id: 5, email: 'googleuser@email.com' },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Google OAuth failed' })
  async googleAuthCallback(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.googleLogin(req.user, res);
  }
}
