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
            // Explicitly load the service account file based on CWD
            // This avoids issues with relative paths in different environments
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const path = await import('path');
            const keyFilePath = path.join(process.cwd(), 'service-account.json');

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const credentials = require(keyFilePath);

            // Fix private_key formatting issues (replace literal \n with actual newlines)
            if (credentials.private_key) {
                credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
            }

            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            this.sheetsClient = google.sheets({ version: 'v4', auth });
            this.spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID') || '';
            this.tabName = this.configService.get<string>('GOOGLE_SHEET_TAB_NAME') || 'Employees';

            this.logger.log('Google Sheets client initialized with explicit credentials');
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
