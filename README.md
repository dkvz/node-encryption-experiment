# AES encryption tests in JS

Experiments in making two CBC-AES256 libraries cooperate. Ideally it should also work in browsers but Node is a start.

-> In the browser we have to use the async version of the pbkdf2 key derivation function.

We're supposed to use it like so for 256b key sizes:
```js
const dKey = pbkdf2.pbkdf2Sync('password', 'salt', 10000, 256 / 8, 'sha1');
```
Where password and salt can actually also be an Array or Buffer (randomBytes gives out a Buffer in Node).

The 10000 parameters is the number of iterations. We should actually use more but I wanted to have the same number I got on the C# end.

I'm really not sure about the sha1. I've seen evidence that it is the default algorithm but I can't find any confirmation.

# Creating random byte arrays
I found [a gist](https://gist.github.com/alexdiliberto/39a4ad0453310d0a69ce) that has code which is compatible with both browsers and Node.

For my Node testing I can just do this:
```
const crypto = require('crypto');
const randBytes = crypto.randomBytes(16);
```

# Padding
Since we're using CBC we need exact multiples of the block size so we might need padding.

The C# module references a padding method called "PKCS7" and there seems to be npm modules we can use to do that in JS.

Let's try [this one](https://www.npmjs.com/package/pkcs7):
```
npm install pkcs7
```

# Conversion to base64
My C# part expects a base64 string.

I found this interesting page: https://coolaj86.com/articles/typedarray-buffer-to-base64-in-javascript/

And so this should work in browsers:
```js
function bufferToBase64(buf) {
  var binstr = Array.prototype.map.call(buf, function (ch) {
    return String.fromCharCode(ch);
  }).join('');
  return btoa(binstr);
}
```

In Node bota doesn't exist. But we should be able to do this:
```js
Buffer.from('Hello World!').toString('base64');
```

And the reverse, just in case:
```js
Buffer.from(b64Encoded, 'base64').toString()
```