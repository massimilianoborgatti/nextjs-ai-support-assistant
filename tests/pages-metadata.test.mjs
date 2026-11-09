import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const output = new URL('../out/', import.meta.url);
const publishedHome = new URL(
  'https://massimilianoborgatti.github.io/nextjs-ai-support-assistant/',
);

test('the Pages export includes static social metadata and its preview PNG', async () => {
  const html = await readFile(new URL('index.html', output), 'utf8');
  const { document } = new JSDOM(html).window;

  function content(attribute, key) {
    const tags = document.head.querySelectorAll(`meta[${attribute}="${key}"]`);
    assert.equal(tags.length, 1, `Expected one ${key} tag in the HTML head`);
    const value = tags[0].getAttribute('content')?.trim();
    assert.ok(value, `Expected nonempty ${key} content`);
    return value;
  }

  const title = content('property', 'og:title');
  const description = content('property', 'og:description');
  const image = content('property', 'og:image');
  const alt = content('property', 'og:image:alt');
  assert.equal(title, document.title);
  assert.equal(content('name', 'description'), description);
  assert.equal(content('property', 'og:type'), 'website');
  assert.equal(content('property', 'og:url'), publishedHome.href);
  assert.equal(content('property', 'og:image:width'), '1200');
  assert.equal(content('property', 'og:image:height'), '630');
  assert.equal(content('name', 'twitter:card'), 'summary_large_image');
  assert.equal(content('name', 'twitter:title'), title);
  assert.equal(content('name', 'twitter:description'), description);
  assert.equal(content('name', 'twitter:image'), image);
  assert.equal(content('name', 'twitter:image:alt'), alt);

  const imageUrl = new URL(image);
  assert.equal(imageUrl.origin, publishedHome.origin);
  assert.ok(imageUrl.pathname.startsWith(publishedHome.pathname));
  assert.ok(imageUrl.pathname.endsWith('.png'));
  const imagePath = imageUrl.pathname.slice(publishedHome.pathname.length);
  const png = await readFile(new URL(imagePath, output));

  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'PNG signature');
  assert.equal(png.toString('ascii', 12, 16), 'IHDR', 'PNG header chunk');
  assert.equal(png.readUInt32BE(16), 1200, 'PNG width');
  assert.equal(png.readUInt32BE(20), 630, 'PNG height');
});
