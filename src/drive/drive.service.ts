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
            let auth;

            // 1. Try loading from Environment Variables (Best for Render/Cloud)
            const clientEmail = this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_EMAIL');
            const privateKey = this.configService.get<string>('GOOGLE_PRIVATE_KEY');

            if (clientEmail && privateKey) {
                const credentials = {
                    client_email: clientEmail,
                    private_key: privateKey.replace(/\\n/g, '\n'),
                };

                auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/drive.file'],
                });
                this.logger.log('Initialized Google Drive with Environment Variable credentials');
            } else {
                // 2. Fallback to keyFile path (Best for Local Dev if using file)
                const keyFile = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
                if (keyFile) {
                    auth = new google.auth.GoogleAuth({
                        keyFile,
                        scopes: ['https://www.googleapis.com/auth/drive.file'],
                    });
                    this.logger.log('Initialized Google Drive with keyFile path');
                }
            }

            if (!auth) {
                throw new Error('No Google Drive credentials found (Checked Env Vars and GOOGLE_APPLICATION_CREDENTIALS)');
            }

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
