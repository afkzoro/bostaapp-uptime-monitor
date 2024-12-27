import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { User, TokenPayload, CustomHttpException } from '@app/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.usersService.findByEmail(email);
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid && !user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new CustomHttpException(
        'Please verify your account',
        HttpStatus.UNAUTHORIZED
      )
    } 
    return user;
  }

  async login(user: User, response: Response): Promise<void> {
    const payload: TokenPayload = {
      userId: user._id as any,
    };

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() +
        Number(this.configService.get('USER_JWT_EXPIRATION')),
    );
    const token = this.jwtService.sign(payload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    });

    response.send();
  }

  logout(response: Response): void {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });

    response.send();
  }
}
