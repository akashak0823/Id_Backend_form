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
var DriveService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const stream_1 = require("stream");
let DriveService = DriveService_1 = class DriveService {
    configService;
    logger = new common_1.Logger(DriveService_1.name);
    driveClient;
    constructor(configService) {
        this.configService = configService;
        this.initializeDrive();
    }
    async initializeDrive() {
        try {
            const keyFile = this.configService.get('GOOGLE_APPLICATION_CREDENTIALS');
            const auth = new googleapis_1.google.auth.GoogleAuth({
                keyFile,
                scopes: ['https://www.googleapis.com/auth/drive.file'],
            });
            this.driveClient = googleapis_1.google.drive({ version: 'v3', auth });
            this.logger.log('Google Drive client initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Google Drive client', error);
        }
    }
    async uploadFile(file) {
        if (!this.driveClient) {
            throw new Error('Google Drive client not initialized');
        }
        const folderId = this.configService.get('GOOGLE_DRIVE_EMPLOYEE_FOLDER_ID');
        if (!folderId) {
            throw new Error('GOOGLE_DRIVE_EMPLOYEE_FOLDER_ID not configured');
        }
        const media = {
            mimeType: file.mimetype,
            body: stream_1.Readable.from(file.buffer),
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
        }
        catch (error) {
            this.logger.error(`Failed to upload file ${file.originalname}`, error);
            throw error;
        }
    }
};
exports.DriveService = DriveService;
exports.DriveService = DriveService = DriveService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DriveService);
//# sourceMappingURL=drive.service.js.map