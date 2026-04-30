const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');
const code = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

try {
  acorn.Parser.extend(jsx()).parse(code, { sourceType: 'module', ecmaVersion: 2020 });
  console.log('OK');
} catch(e) {
  console.log(e.message, e.loc);
}
