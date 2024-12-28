import { HttpException, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { catchError, lastValueFrom } from 'rxjs'

import {
  TokenPayload
} from '@app/common'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor (
    configService: ConfigService,
    private readonly usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any): string => {
          return request?.cookies?.Authentication
        }
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET') as string
    })
  }

  async validate ({ userId }: TokenPayload): Promise<any> {
    return await this.usersService.getUserById(userId)
  }
}
