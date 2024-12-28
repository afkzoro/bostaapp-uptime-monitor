import {
  CustomHttpException,
  EmailService,
  loginUserRequest,
  registerUserRequest,
  ResponseWithStatus,
  User,
  verifyUserRequest,
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
    private readonly emailService: EmailService,
  ) {}

  async register({
    email,
    password,
  }: registerUserRequest): Promise<ResponseWithStatus> {
    await this.checkExistingUser(email);

    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setMinutes(
      verificationTokenExpires.getMinutes() + 5,
    );

    const payload: Partial<User> = {
      email,
      password: await bcrypt.hash(password, 10),
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    };

    try {
      await this.usersRepository.create(payload);
      await this.emailService.sendVerificationEmail(email, verificationToken);
      return { status: 1 };
    } catch (error) {
      throw new CustomHttpException(
        'Failed to register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resendVerification(email: string): Promise<ResponseWithStatus> {
    const user: User = await this.usersRepository.findOne({ email });

    if (!user) {
      throw new CustomHttpException(
        'User with that email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const currentTime = new Date();
    if (
      user.verificationTokenExpires &&
      user.verificationTokenExpires > currentTime
    ) {
      throw new CustomHttpException(
        'Please wait before requesting another verification email',
        HttpStatus.BAD_REQUEST,
      );
    }

    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setMinutes(
      verificationTokenExpires.getMinutes() + 5,
    );

    try {
      await this.usersRepository.findOneAndUpdate(
        {
          _id: user._id.toString(),
        },
        {
          verificationToken,
          verificationTokenExpires,
        },
      );
      await this.emailService.sendVerificationEmail(email, verificationToken);
      return { status: 1 };
    } catch (error) {
      throw new CustomHttpException(
        'Failed to resend verification email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateUser({
    email,
    password,
  }: loginUserRequest): Promise<User> {
    const validateUserRequest: User = await this.usersRepository.findOne({
      email,
    });

    if (validateUserRequest === null) {
      throw new CustomHttpException(
        'User with that email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const isCorrectPassword: boolean = await bcrypt.compare(
      password,
      validateUserRequest.password,
    );

    if (!isCorrectPassword) {
      throw new CustomHttpException(
        'Provided password is incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!validateUserRequest.isVerified) {
      throw new CustomHttpException(
        'Your email is unverified',
        HttpStatus.UNAUTHORIZED,
      );
    }
    validateUserRequest.password = '';
    return validateUserRequest
    
  }


  async verifyEmail({
    email,
    token,
  }: verifyUserRequest): Promise<{ message: string }> {
    const user: User = await this.usersRepository.findOne({
      email,
      verificationToken: token,
    });

    if (!user) {
      throw new CustomHttpException(
        'Verification token is incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.isVerified) {
      throw new CustomHttpException(
        'User is already verified',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if token has expired
    if (new Date() > user.verificationTokenExpires) {
      throw new CustomHttpException(
        'Verification token has expired',
        HttpStatus.GONE,
      );
    }

    await this.usersRepository.findOneAndUpdate(
      {
        _id: user._id.toString(),
      },
      {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    );

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

  async getUserById(_id: string): Promise<User> {
    const _user = await this.usersRepository.findOne(
      {
        _id,
        isVerified: true
      })

    if (_user === null) {
      throw new CustomHttpException(
        `Provided user id is not found: ${_id}`,
        HttpStatus.UNAUTHORIZED
      )
    }
    _user.password = ''
    return _user 
  }
}
