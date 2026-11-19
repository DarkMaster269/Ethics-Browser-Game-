import fs from 'fs';
import path from 'path';

const assetsDir = path.resolve('dist/assets');
const files = fs.readdirSync(assetsDir);

let totalExternal = 0;
files.forEach((file) => {
  const filePath = path.join(assetsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Look for any http/https links except standard XML namespaces like w3.org and static doc links
  const matches = content.match(/https?:\/\/[^\s"'<>)]+/g) || [];
  const runtimeCalls = matches.filter((url) =>
    !url.includes('w3.org') &&
    !url.includes('localhost') &&
    !url.includes('reactjs.org/docs')
  );

  console.log(`[${file}] runtime network calls:`, runtimeCalls.length);
  if (runtimeCalls.length > 0) {
    console.log('Detected URLs:', runtimeCalls);
    totalExternal += runtimeCalls.length;
  }
});

console.log('TOTAL RUNTIME NETWORK CALLS:', totalExternal);
if (totalExternal === 0) {
  console.log('✓ PASS: Zero runtime external network calls! Fully offline-capable.');
} else {
  console.error('✗ FAIL: Found external network calls!');
  process.exit(1);
}
