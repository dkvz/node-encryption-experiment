const aesjs = require('aes-js');
const pbkdf2 = require('pbkdf2');
const crypto = require('crypto');

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
  const textBytes = aesjs.padding.pkcs7.pad(aesjs.utils.utf8.toBytes(text));
  console.log(`Padded message byte length: ${textBytes.length}`);
  const aesCbc = new aesjs.ModeOfOperation.cbc(dKey, iv);
  const encryptedBytes = aesCbc.encrypt(textBytes);
  // We need to add the bytes for the salt and IV (in that order)
  // at the beginning of the encrypted byte array.
  const fullBytes = new Uint8Array(encryptedBytes.length + salt.length + iv.length);
  fullBytes.set(salt);
  fullBytes.set(iv, salt.length);
  fullBytes.set(encryptedBytes, salt.length + iv.length);
  console.log(Buffer.from(fullBytes).toString('base64'));
} else {
  console.log('Missing arguments: message first then key');
}