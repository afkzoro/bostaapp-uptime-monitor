import {
  CustomHttpException,
  registerUserRequest,
  ResponseWithStatus,
  User,
} from '@app/common';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger();

  constructor(private readonly usersRepository: UserRepository) {}

  async register({
    email,
    password,
  }: registerUserRequest): Promise<ResponseWithStatus> {
    await this.checkExistingUser(email);
    const payload: Partial<User> = {
      email,
      password: await bcrypt.hash(password, 10),
      isVerified: false,
    };

    try {
      await this.usersRepository.create(payload);

      //TODO: Verification logic

      //TODO: Notification logic

      return { status: 1 };
    } catch (error) {
      throw new CustomHttpException(
        'Failed to register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByEmail(email) {
    return await this.usersRepository.findOne({ email });
  }

  private async checkExistingUser(email: string): Promise<User> {
    const _email: User | null = await this.usersRepository.findOne({ email });
    if (_email !== null) {
      throw new CustomHttpException(
        'Email already exists',
        HttpStatus.CONFLICT,
      );
    }

    return _email as unknown as User;
  }
}
