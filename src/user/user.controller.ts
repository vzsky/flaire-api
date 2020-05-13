import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query
} from '@nestjs/common'
import { UserService } from './user.service'
import { User } from './user.model'
import { ReqError, Response } from '../helper'
import { AuthGuard } from '@nestjs/passport'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  greet(@Request() req: any) {
    return Response('Success', req.user)
  }

  @Post('create')
  async createUser(@Body() user: User) {
    if (!user || !user.name || !user.password) return ReqError('Bad Request')
    return await this.userService.register(user)
  }

  @Get('all')
  async findAll() {
    return await this.userService.findAll()
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('info')
  async find(@Request() req: any) {
    let name = req.user.username
    if (!name) return ReqError('Pls specify name of user')
    return await this.userService.findUserByName(name)
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any) {
    return req.user
  }
}
