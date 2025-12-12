import { ConfigService } from '@nestjs/config';
export declare class DriveService {
    private configService;
    private readonly logger;
    private driveClient;
    constructor(configService: ConfigService);
    private initializeDrive;
    uploadFile(file: Express.Multer.File): Promise<string>;
}
