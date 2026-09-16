const fs = require('fs');
const path = require('path');

const API_BASE = 'https://ai-helpdesk-tctb.onrender.com/api';
const EMAIL = 'grace@corp.com';
const PASSWORD = 'password';

async function uploadDocuments() {
  console.log('Logging in to get token...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });

  if (!loginRes.ok) {
    console.error('Login failed:', await loginRes.text());
    return;
  }
  const { token } = await loginRes.json();
  console.log('Login successful. Uploading documents...');

  const docsDir = path.join(__dirname, 'helpdesk-ui', 'docs');
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract title from <h1> if possible
    let title = file.replace('.html', '').replace(/_/g, ' ');
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    if (titleMatch) title = titleMatch[1].replace(' - Acme Corp', '');

    console.log(`Uploading ${file}...`);
    const docData = {
      fileName: file,
      title: title,
      category: 'IT Policy',
      content: content
    };

    const uploadRes = await fetch(`${API_BASE}/kb/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(docData)
    });

    if (uploadRes.ok) {
      console.log(`✅ Successfully uploaded ${file}`);
    } else {
      console.error(`❌ Failed to upload ${file}:`, await uploadRes.text());
    }
  }
  console.log('All done!');
}

uploadDocuments();
