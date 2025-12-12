import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private configService: ConfigService) {
        this.initializeCloudinary();
    }

    private initializeCloudinary() {
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

        if (!cloudName || !apiKey || !apiSecret) {
            this.logger.warn('Cloudinary credentials missing in .env');
            return;
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });

        this.logger.log('Cloudinary initialized');
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto', // Auto-detect image or pdf
                    folder: 'employee_documents', // Optional: organize in folder
                },
                (error, result) => {
                    if (error) {
                        this.logger.error('Cloudinary upload failed', error);
                        return reject(error);
                    }
                    if (!result) {
                        return reject(new Error('Cloudinary upload returned undefined result'));
                    }
                    resolve(result.secure_url);
                }
            );

            Readable.from(file.buffer).pipe(uploadStream);
        });
    }
}
