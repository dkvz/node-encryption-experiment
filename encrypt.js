const aesjs = require('aes-js');
const pbkdf2 = require('pbkdf2');
const crypto = require('crypto');
const pkcs7 = require('pkcs7');

const config = {
  saltBytes: 16,
  blockBytes: 16, // IV should be that size
};

if (process.argv.length >= 4) {
  // I use 100000 intermediate variables to make everything
  // as clear as I can for my experimentations.
  const text = process.argv[2];
  const pwd = process.argv[3];
  const iv = crypto.randomBytes(config.blockBytes);
  const salt = crypto.randomBytes(config.saltBytes);
  const dKey = pbkdf2.pbkdf2Sync(pwd, salt, 10000, 256 / 8, 'sha1');
  // Both pad and aesjs.utils.utf8.toBytes work with Uint8Array
  // (Or at least it really looks like it - hope I'm not wrong)
  const textBytes = aesjs.utils.utf8.toBytes(text);
  // We need to add the bytes for the salt and IV (in that order)
  // at the beginning of the encrypted byte array.
  const fullTextBytes = new Uint8Array(textBytes.length + salt.length + iv.length);
  fullTextBytes.set(salt);
  fullTextBytes.set(iv, salt.length);
  fullTextBytes.set(textBytes, salt.length + iv.length);
  console.log(`Full encrypted message byte length: ${fullTextBytes.length}`);
  // cfb() can also take a segmentSize argument, which is 1 by default.
  // I hope this doesn't ruin everything.
  const aesCfb = new aesjs.ModeOfOperation.cfb(dKey, iv);
  const encryptedBytes = aesCfb.encrypt(pkcs7.pad(fullTextBytes));
  console.log(Buffer.from(encryptedBytes).toString('base64'));
  console.log(`Padding the ${textBytes.length} bytes long text: ${pkcs7.pad(textBytes)}`);
} else {
  console.log('Missing arguments: message first then key');
}