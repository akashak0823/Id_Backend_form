import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class SheetsService {
    private readonly logger = new Logger(SheetsService.name);
    private sheetsClient;
    private spreadsheetId: string;
    private tabName: string;

    constructor(private configService: ConfigService) {
        this.initializeSheets();
    }

    private async initializeSheets() {
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
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
                this.logger.log('Loaded Google Sheets credentials from Environment Variables');
            }
            // 2. Fallback to local file (Best for Local Dev)
            else {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const path = await import('path');
                // Standard name expected in root or specific path
                const keyFilePath = path.join(process.cwd(), 'service-account.json');

                const fs = await import('fs');
                if (fs.existsSync(keyFilePath)) {
                    auth = new google.auth.GoogleAuth({
                        keyFile: keyFilePath,
                        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                    });
                    this.logger.log('Loaded Google Sheets credentials from local service-account.json file');
                } else {
                    this.logger.warn('service-account.json not found and Env Vars not set');
                }
            }

            if (!auth) {
                throw new Error('No valid Google Sheets credentials found');
            }

            this.sheetsClient = google.sheets({ version: 'v4', auth });
            this.spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID') || '';
            this.tabName = this.configService.get<string>('GOOGLE_SHEET_TAB_NAME') || 'Employees';

            this.logger.log('Google Sheets client initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Google Sheets client', error);
        }
    }

    async appendRow(rowData: any[]): Promise<number> {
        if (!this.sheetsClient) {
            throw new Error('Google Sheets client not initialized');
        }

        const range = `${this.tabName}!A1`;

        try {
            const response = await this.sheetsClient.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [rowData],
                },
            });

            // return exact updated range or row index if needed, simplistic return here
            this.logger.log(`Appended row to Sheets: ${response.data.updates?.updatedRange}`);
            return 1;
        } catch (error) {
            this.logger.error('Failed to append row to Google Sheets', error);
            throw error;
        }
    }
}
