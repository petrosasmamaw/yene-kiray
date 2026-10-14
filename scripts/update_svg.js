import fs from 'fs';
import path from 'path';

const badgePath = path.resolve('frontend/public/logo-badge.png');
const svgPath = path.resolve('frontend/public/logo-key.svg');

const b64 = fs.readFileSync(badgePath).toString('base64');
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${b64}" width="512" height="512" />
</svg>
`;

fs.writeFileSync(svgPath, svgContent, 'utf-8');
console.log('Successfully updated logo-key.svg with new embedded 3D logo!');
