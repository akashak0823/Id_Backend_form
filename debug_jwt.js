
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        const keyFilePath = path.join(process.cwd(), 'service-account.json');
        const content = fs.readFileSync(keyFilePath, 'utf8');
        const keys = JSON.parse(content);

        console.log('Creating JWT client...');
        const client = new JWT({
            email: keys.client_email,
            key: keys.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        console.log('Authorizing...');
        await client.authorize();
        console.log('Authorized!');

        const sheets = google.sheets({ version: 'v4', auth: client });

        // Try reading A1
        const spreadsheetId = '1rlJR97MlDFYveQhyLNPMdHbViizE2C2_Etqa3tQIFXM'; // Hardcoded from .env check
        console.log('Reading sheet...');
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Employees!A1',
        });
        console.log('Success!', res.data);

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
