
const fs = require('fs');
const path = require('path');

try {
    const keyPath = path.join(process.cwd(), 'service-account.json');
    const content = fs.readFileSync(keyPath, 'utf8');
    const json = JSON.parse(content);

    console.log('Top-level keys:', Object.keys(json).join(', '));
    console.log('Type field:', json.type);
    if (json.private_key) {
        console.log('Private Key Start:', json.private_key.substring(0, 20));
        console.log('Private Key Length:', json.private_key.length);
    } else {
        console.log('Private Key: MISSING');
    }

} catch (e) {
    console.error('Error:', e.message);
}
