const { google } = require('googleapis');
const path = require('path');

async function testAuth() {
    try {
        const keyFilePath = path.join(__dirname, 'service-account.json');
        console.log('Testing auth with file:', keyFilePath);
        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        console.log('SUCCESS! Obtained access token:', token.token ? 'YES' : 'NO');
    } catch (e) {
        console.error('FAILED! Error:', e.message);
    }
}

testAuth();
