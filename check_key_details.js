
const fs = require('fs');
const path = require('path');

try {
    const keyPath = path.join(process.cwd(), 'service-account.json');
    const content = fs.readFileSync(keyPath, 'utf8');
    const json = JSON.parse(content);

    console.log('Project ID:', json.project_id);
    console.log('Client Email:', json.client_email);
    console.log('Private Key ID:', json.private_key_id);
    console.log('Private Key Length:', json.private_key ? json.private_key.length : 'MISSING');

} catch (e) {
    console.error('Error:', e.message);
}
