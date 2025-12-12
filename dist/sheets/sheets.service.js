"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SheetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SheetsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
let SheetsService = SheetsService_1 = class SheetsService {
    configService;
    logger = new common_1.Logger(SheetsService_1.name);
    sheetsClient;
    spreadsheetId;
    tabName;
    constructor(configService) {
        this.configService = configService;
        this.initializeSheets();
    }
    async initializeSheets() {
        try {
            let auth;
            const clientEmail = this.configService.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
            const privateKey = this.configService.get('GOOGLE_PRIVATE_KEY');
            if (clientEmail && privateKey) {
                const credentials = {
                    client_email: clientEmail,
                    private_key: privateKey.replace(/\\n/g, '\n'),
                };
                auth = new googleapis_1.google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
                this.logger.log('Loaded Google Sheets credentials from Environment Variables');
            }
            else {
                const path = await import('path');
                const keyFilePath = path.join(process.cwd(), 'service-account.json');
                const fs = await import('fs');
                if (fs.existsSync(keyFilePath)) {
                    auth = new googleapis_1.google.auth.GoogleAuth({
                        keyFile: keyFilePath,
                        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                    });
                    this.logger.log('Loaded Google Sheets credentials from local service-account.json file');
                }
                else {
                    this.logger.warn('service-account.json not found and Env Vars not set');
                }
            }
            if (!auth) {
                throw new Error('No valid Google Sheets credentials found');
            }
            this.sheetsClient = googleapis_1.google.sheets({ version: 'v4', auth });
            this.spreadsheetId = this.configService.get('GOOGLE_SHEET_ID') || '';
            this.tabName = this.configService.get('GOOGLE_SHEET_TAB_NAME') || 'Employees';
            this.logger.log('Google Sheets client initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Google Sheets client', error);
        }
    }
    async appendRow(rowData) {
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
            this.logger.log(`Appended row to Sheets: ${response.data.updates?.updatedRange}`);
            return 1;
        }
        catch (error) {
            this.logger.error('Failed to append row to Google Sheets', error);
            throw error;
        }
    }
};
exports.SheetsService = SheetsService;
exports.SheetsService = SheetsService = SheetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SheetsService);
//# sourceMappingURL=sheets.service.js.map