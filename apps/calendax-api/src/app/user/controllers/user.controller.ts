import { Controller,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Post,
    Body,
    Put, 
    Delete,
    } from "@nestjs/common";
import { ApiParam} from '@nestjs/swagger';
import { ApiTags } from "@nestjs/swagger";
import { UserService } from "../../user/services/user.service";
import { User } from "../../user/database/user.orm";
import { CreateUserRequestDto } from "../dtos/create-user-request.dto";
import { skipAuth } from "../../utils/decorators/skip-auth.decorator";

@Controller('v1/users')
@ApiTags('Users')
export class UserController{
    constructor(
        private readonly userService: UserService
    ) {}


    @Get('/with-pi')
    @ApiParam({ name: 'pi',
        type: Number, 
        description: 'The Patient Id of the user',
        example: 1,
        required: true })
    @HttpCode(200)
    public getUserwithPI() {
        return this.userService.getUserWithPI();
    }


    @Get('/email/:email')
    @ApiParam({ name: 'email',
        type: String,
        description: "User's Email Address",
        example: 'user@mail.com',
        required: true })
    @HttpCode(200)
    public getUserByEmail(@Param('email') email: string) {
        return this.userService.getUserByEmail(email);
    }

    @Get(':id')
    @ApiParam({ name: 'id',
        type: Number,
        description: 'User ID',
        example: 1,
        required: true })
    @HttpCode(200)
    public getUser(@Param('id', ParseIntPipe) id: User['id']) {
        return this.userService.getUser(id);
    }


    @skipAuth()
    @Post('/')
    @HttpCode(200)
    public createUser(@Body() data: CreateUserRequestDto) {
        return this.userService.createUser(data);
    }


    @Put('/:id')
    @HttpCode(200)
    public updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: CreateUserRequestDto
    ) {
        return this.userService.updateUser(id, data);
    }


    @Delete('/:id')
    @HttpCode(200)
    public deleteUser(
        @Param('id', ParseIntPipe)id: number
    ) {
        return this.userService.deleteUser(id);
    }
}