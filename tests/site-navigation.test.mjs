import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';

const source = readFileSync(new URL('../app/site-link.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
}).outputText;
const exports = {};
new Function('require', 'exports', compiled)(createRequire(import.meta.url), exports);
const SiteLink = exports.default;

test('route links render native anchors without intercepting browser navigation', () => {
  for (const href of ['/vacantes', '/vacantes/team-lead', '/vacantes/team-lead#aplicar', '/#application-form', '/portal']) {
    const element = SiteLink({ href, className: 'secondary-button', children: 'Continuar' });
    assert.equal(element.type, 'a');
    assert.equal(element.props.href, href);
    assert.equal(element.props.onClick, undefined);
    assert.equal(renderToStaticMarkup(element), `<a href="${href}" class="secondary-button">Continuar</a>`);
  }
});

test('mobile close handlers, keyboard accessibility and new-tab links are preserved', () => {
  let closed = false;
  const onClick = () => { closed = true; };
  const element = SiteLink({ href: '/vacantes', onClick, target: '_blank', 'aria-label': 'Ver vacantes' });
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.target, '_blank');
  assert.equal(element.props['aria-label'], 'Ver vacantes');
  element.props.onClick({ preventDefault: () => assert.fail('Native navigation must not be prevented') });
  assert.equal(closed, true);
});

test('all route navigation uses the native link instead of the failing client router', () => {
  for (const file of [
    'home-client.tsx', 'vacantes/jobs-explorer.tsx', 'vacantes/[slug]/job-detail-client.tsx',
    'vacantes/application-form.tsx', 'portal/page.tsx', 'portal/portal-client.tsx',
  ]) {
    const content = readFileSync(new URL(`../app/${file}`, import.meta.url), 'utf8');
    assert.ok(content.includes("import Link from '@/app/site-link'"), file);
    assert.ok(!content.includes("from 'next/link'"), file);
  }
});
