import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, pbkdf2Sync } from 'node:crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';

test('portable password KDF matches existing native 600,000-iteration hashes', async () => {
  const salt = Buffer.from('00112233445566778899aabbccddeeff', 'hex');
  const prehash = createHmac('sha256', Buffer.alloc(32, 7)).update('Synthetic-password-ñ-2026!').digest();
  const expected = pbkdf2Sync(prehash, salt, 600000, 32, 'sha256');
  const portable = await pbkdf2Async(sha256, prehash, salt, { c: 600000, dkLen: 32 });
  assert.deepEqual(Buffer.from(portable), expected);
});
