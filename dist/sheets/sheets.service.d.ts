import { ConfigService } from '@nestjs/config';
export declare class SheetsService {
    private configService;
    private readonly logger;
    private sheetsClient;
    private spreadsheetId;
    private tabName;
    constructor(configService: ConfigService);
    private initializeSheets;
    appendRow(rowData: any[]): Promise<number>;
}
