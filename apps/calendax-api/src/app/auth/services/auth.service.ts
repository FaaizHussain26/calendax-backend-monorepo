import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PlainPassword } from "../../utils/value-objects/password.vo";
import { JWTService } from "../../utils/commonservices/jwt.service";
import { TokenDto } from "../../auth/dtos/token.dto";
import { UserNotFoundException } from "../../utils/exceptions/userNotFound.exception";
import { UserService } from "../../user/services/user.service";
import { HashingService } from "../../utils/commonservices/hashing.service";
import { plainToClass } from "class-transformer";
import { OtpService } from "../../otp/services/otp.service";
import { OtpPurpose } from "../../otp/database/otp.entity";

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly jwtService: JWTService,
        private readonly userService: UserService,
        private readonly otpService: OtpService,
        private readonly hashingService: HashingService,
    ) {}


    async logIn(email: string, pass: PlainPassword): Promise<string> {
        try{
            const user = await this.userService.getUserByEmail(email);
            if (!user) {
                throw new UserNotFoundException();
            }
            const isMatch = await this.hashingService.assertSamePassword(
                pass as PlainPassword,
                user.password,
            )
            // const isMatch = await bcrypt.compare(pass, user.password);
            if (!isMatch){
                throw new UnauthorizedException();
            }

            await this.otpService.sendOtp(
                user.id,
                user.email,
                user.firstName || user.email,
                OtpPurpose.VERIFICATION,
            )
            return 'Otp has been sent to your email';
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async verifyUser(email: string, otp: string): Promise<TokenDto | null> {
            const user = await this.userService.getUserByEmail(email);

            await this.otpService.verifyAndConsume(
                user.id,
                otp,
                OtpPurpose.VERIFICATION,
            )

            const [accessToken, refreshToken] = await Promise.all([this.jwtService.generateAccesToken(user.id, email),
                this.jwtService.generateRefreshToken(user.id, email)]);
            const { password, passwordExpiresAt, deletedAt, createdAt, updatedAt,  ...userDto } = user; 

            return plainToClass(TokenDto, {
                ...userDto,
                accessToken,
                refreshToken
            },{ excludeExtraneousValues: true });
    }


    async generateNewAccessToken (refreshToken: string) {
        return await this.jwtService.refresh(refreshToken);
    }
}