import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDoc } from './user.model'
import { Response, ResponseType, ReqError } from '../helper'
import { hash, compare } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private userModel: Model<User>,
        private readonly jwtService: JwtService,
    ) {}

    private blindPassword(user: User): User {
        user.password = 'H4SheD'
        return user
    }

    private isResponseType(param: any): param is ResponseType {
        if (param === undefined) return false
        return (param as ResponseType).status !== undefined
    }

    private isUserType(param: any): param is User {
        // UserDoc will be treated as User
        if (param === undefined) return false
        return (param as User).name !== undefined
    }

    private async createUser(user: User): Promise<UserDoc> {
        user.password = await hash(user.password, 10)
        const newuser = await this.userModel.create(user)
        return this.blindPassword(newuser)
    }

    private async getToken(user: User | UserDoc): Promise<string> {
        return this.jwtService.signAsync(
            { name: user.name, role: user.role },
            { expiresIn: 60 * 60 },
        )
    }

    async updateUser(user: UserDoc): Promise<UserDoc> {
        const updated = await this.userModel
            .findByIdAndUpdate(user._id, user)
            .exec()
        return this.blindPassword(updated)
    }

    async findUserByName(name: string): Promise<UserDoc | ResponseType> {
        const user = await this.userModel.findOne({ name }).exec()
        if (user) return user
        return Response('Success', 'User Not Found')
    }

    async register(user: User): Promise<UserDoc | ResponseType> {
        let exist = await this.findUserByName(user.name)
        if (this.isUserType(exist))
            return Response('Failed', 'This Name is Used')
        user.role = 0
        return await this.createUser(user)
    }

    async findAll(): Promise<User[]> {
        const users = await this.userModel.find().exec()
        return users.map(val => {
            return this.blindPassword(val)
        })
    }

    async login(name: string, password: string): Promise<ResponseType> {
        let user = await this.findUserByName(name)
        if (this.isResponseType(user)) return Response('Failed', 'No Such User')
        let valid = await compare(password, user.password)
        if (!valid) return Response('Failed', 'Wrong Password')
        let token = await this.getToken(user)
        return Response('Success', token)
    }
}
