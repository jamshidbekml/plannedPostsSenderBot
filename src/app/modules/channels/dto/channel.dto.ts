import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IChannel } from '../interface/channel.interface';

export class AddChannelDto implements IChannel {
    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    chatId: number;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    chatTitle: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    userChatId: any;

    @IsString()
    chatLink: string;
}
