import {
  CustomHttpException,
  EmailService,
  registerUserRequest,
  ResponseWithStatus,
  User,
} from '@app/common';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger();

  constructor(
    private readonly usersRepository: UserRepository,
    private readonly emailService: EmailService
  ) {}

  async register({
    email,
    password,
  }: registerUserRequest): Promise<ResponseWithStatus> {
    await this.checkExistingUser(email);
   
    const verificationToken = uuidv4()
   
    const payload: Partial<User> = {
      email,
      password: await bcrypt.hash(password, 10),
      isVerified: false,
      verificationToken
    };

    try {
     await this.usersRepository.create(payload);
     await this.emailService.sendVerificationEmail(email, verificationToken)
      return { status: 1 };
    } catch (error) {
      throw new CustomHttpException(
        'Failed to register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async verifyEmail(token: string): Promise<{ message: string }> {
    const user: User = await this.usersRepository.findOne({ verificationToken: token })

    if (!user) {
      throw new CustomHttpException(
        'Verification token is incorrect',
        HttpStatus.UNAUTHORIZED
      )
    }

    if (user.isVerified) {
      throw new CustomHttpException(
        'User is already verified',
        HttpStatus.BAD_REQUEST
      )
    }

    await this.usersRepository.findOneAndUpdate({
        _id: user._id.toString(),
        
    }, {
        isVerified: true,
        verificationToken: undefined
    })

    return { message: 'Email verified successfully' };
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
