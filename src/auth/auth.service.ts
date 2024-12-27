import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { User, TokenPayload } from '@app/common';
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
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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
