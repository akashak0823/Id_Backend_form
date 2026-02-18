
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function main() {
    try {
        // Auth
        let auth;
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY;

        if (clientEmail && privateKey) {
            auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: clientEmail,
                    private_key: privateKey.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        } else {
            const keyFilePath = path.join(process.cwd(), 'service-account.json');
            if (fs.existsSync(keyFilePath)) {
                auth = new google.auth.GoogleAuth({
                    keyFile: keyFilePath,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
            }
        }

        if (!auth) throw new Error('No credentials found');

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const tabName = process.env.GOOGLE_SHEET_TAB_NAME || 'Employees';

        // 1. Get Sheet ID (we need sheetId (integer) not spreadsheetId (string) for batchUpdate)
        const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });
        const sheet = sheetMetadata.data.sheets.find(s => s.properties.title === tabName);
        if (!sheet) throw new Error(`Sheet ${tabName} not found`);
        const sheetId = sheet.properties.sheetId;

        console.log(`Found Sheet "${tabName}" (ID: ${sheetId})`);

        // 2. Insert Row at Index 0
        console.log('Inserting blank row at top...');
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    insertDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: 0,
                            endIndex: 1
                        },
                        inheritFromBefore: false
                    }
                }]
            }
        });

        // 3. Write Headers
        const SHEET_HEADERS = [
            "Full Name", "Date of Birth", "Gender", "Contact Number", "Emergency Contact Number", "Email ID",
            "Department", "Designation", "Joining Date", "Blood Group", "Father Name", "Mother Name",
            "Total Family Members", "Spouse Name", "Spouse Employment Status", "Nominee Name",
            "Contact Address", "Permanent Address", "Bank Name", "Bank Account Number", "IFSC Code",
            "Photo", "Aadhaar Card", "PAN", "Birth Certificate", "Community Certificate",
            "Income Certificate", "Nativity Certificate", "Educational Certificates", "Selected Sibling",
            "Siblings Details", "Children Details"
        ];

        console.log('Writing headers...');
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${tabName}!A1`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [SHEET_HEADERS]
            }
        });

        console.log('Success! Headers inserted.');

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
