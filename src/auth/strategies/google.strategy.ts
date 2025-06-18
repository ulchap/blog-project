import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super({
      clientID: configService.getOrThrow('CLIENT_ID'),
      clientSecret: configService.getOrThrow('CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    let user = await this.userRepository.findOne({
      where: { email: emails[0].value },
    });
    if (!user) {
      user = this.userRepository.create({
        provider: 'google',
        googleId: id,
        email: emails[0].value,
        name: `${name.givenName} ${name.familyName}`,
      });
      user = await this.userRepository.save(user);
    }
    done(null, user);
  }
}
