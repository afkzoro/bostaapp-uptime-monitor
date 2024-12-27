import {  registerUserRequest, User } from '@app/common';
import { BadRequestException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './users.repository';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    private readonly logger = new Logger()

    constructor (
        private readonly usersRepository: UserRepository

    ) {}

    async register ({
        email, 
        password,
    }: registerUserRequest) {

        await this.checkExistingUser(email)
        const payload: Partial<User> = {
            email,
            password: await bcrypt.hash(password, 10),
            isVerified: false,   
        }

        try {
            const user = await this.usersRepository.create(payload)
            //TODO: Verification logic

            //TODO: Notification logic

            return user
        } catch (error) {
            throw new BadRequestException(
                `can not process request. Try again later ${JSON.stringify(error)}`,
            )
        }
    }


    
    async findByEmail (email) {
        return await this.usersRepository.findOne({ email})
    }




    private async checkExistingUser (email: string): Promise<User> {
        const _email: User | null = await this.usersRepository.findOne({ email })

        if (_email !== null) {
            throw new BadRequestException(
                'Email is already registered.',
            )
        }

        return _email as unknown as User
    }
}
