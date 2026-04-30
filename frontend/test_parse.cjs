const fs = require('fs');
const code = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

let stack = [];
let lines = code.split('\n');

try {
  require('esbuild').transformSync(code, { loader: 'jsx' });
  console.log('OK');
} catch (e) {
  console.error(e.message);
}
