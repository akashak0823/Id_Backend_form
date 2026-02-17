import { ConfigService } from '@nestjs/config';
export declare class SupabaseService {
    private configService;
    private readonly logger;
    private supabase;
    private bucketName;
    constructor(configService: ConfigService);
    private initializeSupabase;
    uploadFile(file: Express.Multer.File): Promise<string>;
}
