
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
                // Read and parse file explicitly
                const content = fs.readFileSync(keyFilePath, 'utf8');
                const json = JSON.parse(content);
                console.log('Explicitly loaded credentials from file.');
                console.log('Email:', json.client_email);
                console.log('Key length:', json.private_key ? json.private_key.length : 0);

                auth = new google.auth.GoogleAuth({
                    credentials: {
                        client_email: json.client_email,
                        private_key: json.private_key,
                    },
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
            }
        }

        if (!auth) throw new Error('No credentials found');

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const tabName = process.env.GOOGLE_SHEET_TAB_NAME || 'Employees';

        console.log(`Checking Spreadsheet: ${spreadsheetId}, Tab: ${tabName}`);

        // Read A1
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${tabName}!A1:A1`,
        });

        console.log('Get A1 Result:', JSON.stringify(res.data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
