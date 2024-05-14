const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  // eslint-disable-next-line no-undef
  __dirname,
  '..',
  'node_modules',
  'jose',
  'dist',
  'node',
  'cjs',
  'runtime',
  'check_modulus_length.js'
);

try {
  let data = fs.readFileSync(targetFile, 'utf8');
  let result = data.replace(
    'if (getModulusLength(key) < 2048)',
    'if (getModulusLength(key) < 1024)'
  );
  fs.writeFileSync(targetFile, result, 'utf8');
  console.log('Successfully modified check_modulus_length.js');
} catch (err) {
  console.error('Error modifying the jose module:', err);
}
