import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private readonly logger = new Logger(SupabaseService.name);
    private supabase: SupabaseClient;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        this.initializeSupabase();
    }

    private initializeSupabase() {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            this.logger.error('Supabase URL or Key missing in .env');
            throw new Error('Supabase configuration missing');
        }

        this.bucketName = this.configService.get<string>('SUPABASE_BUCKET_NAME') || 'Documents_ID';

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log(`Supabase client initialized with bucket: ${this.bucketName}`);
    }

    async uploadFile(file: Express.Multer.File, originalName: string): Promise<string> {
        try {
            // Generate a unique file name
            const fileExt = originalName.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) {
                this.logger.error('Supabase upload failed', error);
                throw new InternalServerErrorException('Failed to upload file');
            }

            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(fileName);

            return urlData.publicUrl;
        } catch (err) {
            this.logger.error('Supabase upload exception', err);
            throw new InternalServerErrorException('Error uploading file to storage');
        }
    }

    async insertEmployee(record: any): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('employees')
                .insert([record]);

            if (error) {
                this.logger.error('Failed to insert employee into Supabase', error);
                throw new InternalServerErrorException('Failed to save record to database');
            }
        } catch (err) {
            this.logger.error('Supabase insert exception', err);
            throw new InternalServerErrorException('Error saving record to database');
        }
    }
}
