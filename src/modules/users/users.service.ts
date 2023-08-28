import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Repository } from "typeorm";
import * as crypto from 'crypto';
import * as bcrypt from "bcrypt";
import { plainToClass } from "class-transformer";
import { RegisterModel } from "../models/register.model";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { LoginModel } from "../models/login.model";
import { compare } from 'bcrypt';
import { AuthService } from "../auth/auth.service";
import { RoleDto } from "../dto/role.dto";
import { RoleModel } from "../models/role.model";
import { ChangePasswordDto } from "../dto/changepassoword.dto";
import { ChangePasswordModel } from "../models/changepassword.model";
import { BlockUserDto } from "../dto/blockuser.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly authService: AuthService
    ) { }

    async generateRandomPassword(length: number = 12): Promise<string> {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomBytes = crypto.randomBytes(length);
        const passwordArray = new Array(length);

        for (let i = 0; i < length; i++) {
            passwordArray[i] = characters[randomBytes[i] % characters.length];
        }

        return passwordArray.join('');
    }

    async encodePassword(password: string): Promise<string> {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }

    async createUser(username: string, registerDto: RegisterDto): Promise<RegisterModel> {
        const { user_name, user_role } = registerDto;
        const creater = await this.userRepository.findOne({ where: { user_name: username } });
        const existUser = await this.userRepository.findOne({ where: { user_name: user_name } });

        if (creater.user_role === "admin" || creater.user_role === "manager") {
            const created_user = creater.user_name;

            if (!existUser) {
                const registerEntity = plainToClass(UserEntity, registerDto)
                const password = await this.generateRandomPassword(12);
                registerEntity.user_password = await this.encodePassword(password);
                registerEntity.user_role = user_role;
                registerEntity.creater = created_user
                const newUser = await this.userRepository.save(registerEntity);
                const result = {
                    user_name: newUser.user_name,
                    user_password: password,
                    user_fullname: newUser.user_fullname
                };
                return result;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }


    async Login(loginDto: LoginDto): Promise<LoginModel> {
        const { user_name, user_password } = loginDto;
        const user = await this.userRepository.findOne({ where: { user_name } })
        if (user) {
            const isPasswordValid = await compare(user_password, user.user_password);
            if (isPasswordValid) {
                const payload = { sub: user.user_id, username: user.user_name }
                const token = await this.authService.createToken(payload)
                const result = {
                    user_name: user.user_name,
                    user_fullname: user.user_fullname,
                    user_state: user.user_state,
                    access_token: token,
                }
                return result;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    async getRoleByUserName(roleDto: RoleDto): Promise<RoleModel> {
        const { user_name } = roleDto;
        const user = await this.userRepository.findOne({ where: { user_name } })
        if (user) {
            const result = {
                user_role: user.user_role,
                user_name: user.user_name,
                user_fullname: user.user_fullname
            }
            return result;
        } else {
            return null;
        }
    }

    async updatePassword(username: string, changePasswordDto: ChangePasswordDto): Promise<ChangePasswordModel> {
        if (username) {
            const { user_name, old_password, new_password } = changePasswordDto;
            const user = await this.userRepository.findOne({ where: { user_name } })
            if (user) {

                const isPasswordValid = await compare(old_password, user.user_password);
                if (isPasswordValid) {
                    const hashedPassword = await this.encodePassword(new_password)
                    user.user_password = hashedPassword
                    await this.userRepository.save(user);
                    const result = {
                        user_name: user.user_name,
                        user_password: new_password,
                    }
                    return result;
                } else {
                    return null;
                }
            } else {
                return null
            }
        }
    }

    async getAllUsers(username: string, rows: number, page: number) {
        if (username) {
            const countUsers = await this.userRepository.count();
            const users = await this.userRepository.find({
                where: { user_role: 'partner' },
                select: ['user_id', 'user_name', 'user_fullname', 'user_state'],
                order: { user_id: 'ASC' },
                skip: rows * (page - 1),
                take: rows,
            });

            const result = {
                records: users,
                page: Math.ceil(countUsers / rows)
            }

            return result;
        } else {
            return null;
        }

    }

    async blockUser(username: string, blockUserDto: BlockUserDto) {
        if (username) {
            const { action_type, user_name } = blockUserDto;

            const user = await this.userRepository.findOne({ where: { user_name } })
            if (user) {
                if (action_type === "block") {
                    user.user_state = "block";
                } else {
                    user.user_state = "active";
                }
                await this.userRepository.save(user);
                return {
                    user_name: user.user_name,
                    user_state: user.user_state
                }
            } else {
                return null;
            }
        }
    }
}