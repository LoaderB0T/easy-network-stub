import fs from 'fs';

fs.writeFileSync(
  './dist/cjs/package.json',
  `{
  "type": "CommonJS"
}`
);
