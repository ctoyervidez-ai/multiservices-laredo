import assert from 'node:assert/strict';
import { test } from 'node:test';

const origin = new URL(process.env.TEST_SITE_URL || 'http://localhost:3001').origin;
const documents = new Map();
async function readPage(path) {
  if (!documents.has(path)) {
    const response = await fetch(`${origin}${path}`, { redirect: 'manual' });
    assert.equal(response.status, 200, `Page must be available: ${path}`);
    documents.set(path, await response.text());
  }
  return documents.get(path);
}
function links(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((match) => match[1].replaceAll('&amp;', '&'));
}

test('every rendered public link has an existing page and anchor destination', async () => {
  const queue = ['/', '/vacantes'];
  const visited = new Set();
  for (const path of queue) {
    if (visited.has(path)) continue;
    visited.add(path);
    const html = await readPage(path);
    for (const href of new Set(links(html))) {
      assert.notEqual(href, '#', `Empty link on ${path}`);
      const destination = new URL(href, `${origin}${path}`);
      if (destination.origin !== origin) continue;
      const targetPath = destination.pathname + destination.search;
      const target = await readPage(targetPath);
      if (destination.hash) {
        const id = decodeURIComponent(destination.hash.slice(1));
        assert.ok(target.includes(`id="${id}"`), `Missing anchor: ${path} -> ${href}`);
      }
      if (destination.pathname.startsWith('/vacantes')) queue.push(targetPath);
    }
  }
  assert.ok(visited.size >= 2);
});

test('contact actions use the requested email and transport opens an inquiry, not an application', async () => {
  const homepage = await readPage('/');
  const homeLinks = links(homepage);
  assert.ok(homeLinks.includes('mailto:vacantes@multiservicesldo.com'));
  const vacancyLinks = links(await readPage('/vacantes'));
  assert.ok(vacancyLinks.includes('mailto:vacantes@multiservicesldo.com'));
  assert.ok(!homepage.includes('operations@multiservicesldo.com'));
  const transport = homeLinks.map((href) => new URL(href, origin))
    .find((url) => url.hostname === 'wa.me' && url.searchParams.get('text')?.includes('transporte'));
  assert.ok(transport, 'Transportation CTA must open its own inquiry');
  if (vacancyLinks.some((href) => href.startsWith('/vacantes/'))) {
    assert.match(homepage, /href="\/vacantes\/[^"#]+#aplicar"/);
  } else {
    assert.ok(homeLinks.includes('#application-form'));
    assert.ok(homepage.includes('Comparte tu perfil.'));
  }
});
