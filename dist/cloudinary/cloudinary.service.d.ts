import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private initializeCloudinary;
    uploadFile(file: Express.Multer.File): Promise<string>;
}
