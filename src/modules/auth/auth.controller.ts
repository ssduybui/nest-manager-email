import { Controller, Get, Headers } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ResponseData } from "src/global/globalClass";
import { SessionModel } from "../models/session.model";

@Controller('auth')

export class AuthController { }