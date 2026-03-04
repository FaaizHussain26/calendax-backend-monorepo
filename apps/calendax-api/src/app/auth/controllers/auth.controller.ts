import { Body, Controller, HttpCode, Post, UseInterceptors, ClassSerializerInterceptor } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { logInDto } from "../dtos/log-in.dto";
import { AuthenticationService } from "../services/auth.service";
import { skipAuth } from "../../utils/decorators/skip-auth.decorator";
import { RefreshTokenDto } from "../../utils/commonDtos/refresh-token.dto";
import { VerifyOtpDto } from "../../otp/dtos/verify-otp.dto";

@Controller("v1/auth")
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags("Authentication")
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService
    ) {}

    @skipAuth()
    @Post("/login")
    @HttpCode(200)
    logIn(@Body() logInDto: logInDto) {
        return this.authenticationService.logIn(logInDto.email, logInDto.password);
    }

    @skipAuth()
    @Post('/verify')
    @HttpCode(200)
    verify(@Body() verifyOtpDto: VerifyOtpDto) {
        return this.authenticationService.verifyUser(verifyOtpDto.email, verifyOtpDto.code);
    }


    @skipAuth()
    @Post("/refresh")
    @HttpCode(200)
    newAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authenticationService.generateNewAccessToken(refreshTokenDto.refreshToken);
    }
}