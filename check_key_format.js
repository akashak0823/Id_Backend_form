
const fs = require('fs');
const path = require('path');

try {
    const keyPath = path.join(process.cwd(), 'service-account.json');
    if (!fs.existsSync(keyPath)) {
        console.error('service-account.json NOT found');
        process.exit(1);
    }

    const content = fs.readFileSync(keyPath, 'utf8');
    const json = JSON.parse(content);

    const privateKey = json.private_key;
    if (!privateKey) {
        console.error('private_key field MISSING in json');
        process.exit(1);
    }

    console.log('System Time:', new Date().toISOString());
    console.log('Key Length:', privateKey.length);
    console.log('Starts with Header:', privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));
    console.log('Ends with Footer:', privateKey.trim().endsWith('-----END PRIVATE KEY-----'));
    console.log('Contains \\n:', privateKey.includes('\n'));
    console.log('Contains \\\\n (escaped):', privateKey.includes('\\n'));

    // Check if newlines are real or escaped
    const lines = privateKey.split('\n');
    console.log('Number of lines (by \\n):', lines.length);

} catch (e) {
    console.error('Error:', e.message);
}
