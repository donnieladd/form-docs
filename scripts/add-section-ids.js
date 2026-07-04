const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../content/operational-philosophy.html');
let content = fs.readFileSync(filePath, 'utf-8');

let sectionCount = 0;
content = content.replace(/<section class="sec">/g, (match) => {
  const id = `sec-${sectionCount.toString().padStart(2, '0')}`;
  sectionCount++;
  return `<section class="sec" id="${id}">`;
});

// Handle the last section which has a different style
content = content.replace(/<section class="sec" style="border-bottom:none;">/g, (match) => {
  const id = `sec-${sectionCount.toString().padStart(2, '0')}`;
  sectionCount++;
  return `<section class="sec" id="${id}" style="border-bottom:none;">`;
});

fs.writeFileSync(filePath, content);
console.log(`Added IDs to ${sectionCount} sections.`);
