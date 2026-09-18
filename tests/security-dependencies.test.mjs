import assert from 'node:assert/strict';
import { test } from 'node:test';
import nodemailer from 'nodemailer';
import sharp from 'sharp';
import { v4, validate } from 'uuid';
import { DataTypes, Sequelize } from 'sequelize';

test('UUID generation remains compatible with model identifiers', () => {
  const first = v4();
  assert.equal(validate(first), true);
  assert.notEqual(first, v4());
});

test('email rendering works without sending a message', async () => {
  const transport = nodemailer.createTransport({ streamTransport: true, buffer: true });
  const message = await transport.sendMail({
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Portfolio compatibility test',
    text: 'Plain text content',
    html: '<p>HTML content</p>',
  });
  assert.match(message.message.toString(), /multipart\/alternative/);
  assert.match(message.message.toString(), /Portfolio compatibility test/);
});

test('image processing still produces bounded WebP output', async () => {
  const source = Buffer.from('<svg width="20" height="20"><rect width="20" height="20" fill="red"/></svg>');
  const output = await sharp(source).resize({ width: 10 }).webp({ quality: 80 }).toBuffer();
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.format, 'webp');
  assert.equal(metadata.width, 10);
});

test('Sequelize rejects injected JSON cast types before querying', () => {
  const database = new Sequelize('postgres://test:test@127.0.0.1/test', { logging: false });
  const Record = database.define('Record', { payload: DataTypes.JSONB });
  const generator = database.getQueryInterface().queryGenerator;
  assert.throws(() => generator.selectQuery('records', {
    where: { payload: { 'role::text) or 1=1--': 'admin' } },
  }, Record));
});
