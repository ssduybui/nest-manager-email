import { Body, Controller, Get, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { RegisterDto } from "../dto/register.dto";
import { ResponseData } from "src/global/globalClass";
import { RegisterModel } from "../models/register.model";
import { LoginDto } from "../dto/login.dto";
import { LoginModel } from "../models/login.model";
import { RoleDto } from "../dto/role.dto";
import { RoleModel } from "../models/role.model";
import { ChangePasswordDto } from "../dto/changepassoword.dto";
import { ChangePasswordModel } from "../models/changepassword.model";
import { BlockUserDto } from "../dto/blockuser.dto";
import { AuthGuard } from "../auth/auth.guard";
import { Request } from 'express';

@Controller('users')

export class UsersController {

    constructor(
        private readonly usersService: UsersService
    ) { }

    @Post('register')
    @UseGuards(AuthGuard)
    async createrUser(@Req() req: Request, @Body() registerDto: RegisterDto) {
        try {
            const userData = req.user
            const userResult = await this.usersService.createUser(userData.username, registerDto);
            if (userResult === null) {
                return new ResponseData<RegisterModel>(null, 400, 'User already exists');
            } else {
                return new ResponseData<RegisterModel>(userResult, 200, "Registration Successfull")
            }
        } catch (error) {
            return new ResponseData<RegisterModel>([], 500, "Unable to register. Please log in again")
        }
    }

    @Post('login')
    async Login(@Body() loginDto: LoginDto) {
        try {
            const data = await this.usersService.Login(loginDto)
            if (data !== null) {
                if (data.user_state === 'block') {
                    return new ResponseData<LoginModel>(data, 400, 'User is blocked');
                } else {
                    return new ResponseData<LoginModel>(data, 200, "Login Success")
                }

            } else {
                return new ResponseData<LoginModel>([], 400, "Account or password incorrect")
            }
        } catch (error) {
            console.log(error)
            return new ResponseData<LoginModel>([], 500, "Unable to login. Please wait a few minutes")
        }
    }

    @Post('role')
    async getRoleByUserName(@Body() roleDto: RoleDto) {
        try {
            const role = await this.usersService.getRoleByUserName(roleDto)
            if (role !== null) {
                return new ResponseData<RoleModel>(role, 200, "Success")
            } else {
                return new ResponseData<RoleModel>([], 400, "Failed")
            }
        } catch (error) {
            return new ResponseData<RoleModel>([], 500, "Internal Server Error")
        }
    }

    @Put('change-pw')
    @UseGuards(AuthGuard)
    async updatePassword(@Req() req: Request, @Body() changePasswordDto: ChangePasswordDto) {
        try {
            const userData = req.user
            const role = await this.usersService.updatePassword(userData.username, changePasswordDto)
            if (role !== null) {
                return new ResponseData<ChangePasswordModel>(role, 200, "Change password success")
            } else {
                return new ResponseData<ChangePasswordModel>([], 400, "Old password is incorrect")
            }
        } catch (error) {
            return new ResponseData<ChangePasswordModel>([], 500, "Internal Server Error")
        }
    }

    @Get('all-users')
    @UseGuards(AuthGuard)
    async getAllUsers(
        @Req() req: Request,
        @Query('rows') rows: string,
        @Query('page') page: string,
    ) {
        try {
            const userData = req.user
            const rowsInt = Number(rows);
            const pageInt = Number(page);
            const data = await this.usersService.getAllUsers(userData.username, rowsInt, pageInt)
            if (data !== null) {
                return new ResponseData<any>(data, 200, "Success")
            } else {
                return new ResponseData<any>([], 400, "Failed")
            }
        } catch (error) {
            console.log(error)
            return new ResponseData<any>([], 500, "Internal Server Error")
        }
    }

    @Put('controll-user')
    @UseGuards(AuthGuard)
    async blockUser(@Req() req: Request, @Body() blockUserDto: BlockUserDto) {
        try {
            const userData = req.user
            const data = await this.usersService.blockUser(userData.username, blockUserDto)
            if (data !== null) {
                return new ResponseData(data, 200, "Success")
            } else {
                return new ResponseData([], 400, "Failed")
            }
        } catch (error) {
            console.log(error)
            return new ResponseData<ChangePasswordModel>([], 500, "Internal Server Error")
        }
    }

}