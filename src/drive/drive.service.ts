import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class DriveService {
    private readonly logger = new Logger(DriveService.name);
    private driveClient;

    constructor(private configService: ConfigService) {
        this.initializeDrive();
    }

    private async initializeDrive() {
        try {
            const keyFile = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
            const auth = new google.auth.GoogleAuth({
                keyFile,
                scopes: ['https://www.googleapis.com/auth/drive.file'],
            });
            this.driveClient = google.drive({ version: 'v3', auth });
            this.logger.log('Google Drive client initialized');
        } catch (error) {
            this.logger.error('Failed to initialize Google Drive client', error);
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        if (!this.driveClient) {
            throw new Error('Google Drive client not initialized');
        }

        const folderId = this.configService.get<string>('GOOGLE_DRIVE_EMPLOYEE_FOLDER_ID');
        if (!folderId) {
            throw new Error('GOOGLE_DRIVE_EMPLOYEE_FOLDER_ID not configured');
        }

        const media = {
            mimeType: file.mimetype,
            body: Readable.from(file.buffer),
        };

        try {
            const response = await this.driveClient.files.create({
                requestBody: {
                    name: `${Date.now()}_${file.originalname}`,
                    parents: [folderId],
                },
                media: media,
                fields: 'id, webViewLink, webContentLink',
                supportsAllDrives: true,
            });

            return response.data.webViewLink;
        } catch (error) {
            this.logger.error(`Failed to upload file ${file.originalname}`, error);
            throw error;
        }
    }
}
