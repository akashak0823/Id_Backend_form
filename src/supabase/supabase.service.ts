import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private readonly logger = new Logger(SupabaseService.name);
    private supabase: SupabaseClient;
    private bucketName = 'employee_documents';

    constructor(private configService: ConfigService) {
        this.initializeSupabase();
    }

    private initializeSupabase() {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            this.logger.error('Supabase credentials missing in .env');
            return;
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase client initialized');
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        if (!this.supabase) {
            throw new Error('Supabase client not initialized');
        }

        const fileName = `${Date.now()}-${file.originalname}`;
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            this.logger.error(`Supabase upload failed: ${error.message}`, error);
            // Throw a standard error to avoid "Invalid status code" issues in NestJS exception filter
            throw new Error(`Supabase upload failed: ${error.message || 'Unknown error'}`);
        }

        const { data: publicUrlData } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    }
}
