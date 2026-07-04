const fs = require('fs');
const path = require('path');
const https = require('https');

const token = process.env.VERCEL_TOKEN;
const deploymentId = 'dpl_EattXWpEJko75Ja6YKSfMg7JdC9b';
const teamId = 'team_KOOxummDByeSgEtBYAm6oEih';

async function fetchFiles() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: `/v6/deployments/${deploymentId}/files?teamId=${teamId}`,
      headers: { 'Authorization': `Bearer ${token}` }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function downloadFile(uid, filepath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: `/v7/file/${uid}?teamId=${teamId}`,
      headers: { 'Authorization': `Bearer ${token}` }
    };
    https.get(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${uid}: ${res.statusCode}`));
        return;
      }
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function processTree(tree, currentPath = '') {
  for (const item of tree) {
    const itemPath = path.join(currentPath, item.name);
    if (item.type === 'directory') {
      await processTree(item.children, itemPath);
    } else if (item.type === 'file') {
      console.log(`Downloading ${itemPath}...`);
      await downloadFile(item.uid, path.join('/Users/dontaeladson/Projects/form-docs', itemPath));
    }
  }
}

async function main() {
  try {
    const files = await fetchFiles();
    await processTree(files);
    console.log('Done!');
  } catch (err) {
    console.error(err);
  }
}

main();
