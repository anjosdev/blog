import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDate, groupPosts, parsePostPath, postUrl } from '../src/lib/posts.ts';

const entry = (id: string, title = 'A note') => ({ id, data: { title } });

test('pairs translations by directory and sorts posts newest first across years', () => {
  const posts = groupPosts([
    entry('2026/10/26/first/index_pt-br.md', 'Primeiro'),
    entry('2025/12/31/last-year/index.md'),
    entry('2027/01/01/new-year/index.md'),
    entry('2026/10/26/first/index.md', 'First'),
    entry('2026/10/25/older/index.md'),
  ]);
  assert.deepEqual(posts.map(({ date }) => date), ['2027-01-01', '2026-10-26', '2026-10-25', '2025-12-31']);
  assert.equal(posts[1].portuguese?.data.title, 'Primeiro');
  assert.equal(posts[1].english.data.title, 'First');
  assert.equal(posts[0].portuguese, undefined);
});

test('allows the same slug on different dates without mixing translations', () => {
  const posts = groupPosts([
    entry('2026/10/25/note/index.md'),
    entry('2026/10/26/note/index_pt-br.md'),
    entry('2026/10/26/note/index.md'),
  ]);
  assert.equal(posts.length, 2);
  assert.ok(posts[0].portuguese);
  assert.equal(posts[1].portuguese, undefined);
  assert.notEqual(postUrl(posts[0].path), postUrl(posts[1].path));
});

test('rejects orphan translations with the exact missing path', () => {
  assert.throws(() => groupPosts([entry('2026/10/26/note/index_pt-br.md')]), /add content\/2026\/10\/26\/note\/index.md/);
});

test('accepts leap days and rejects impossible calendar dates', () => {
  assert.equal(parsePostPath('2028/02/29/leap-day/index.md').date, '2028-02-29');
  for (const date of ['2026/02/29', '2026/04/31', '2026/13/01', '2026/00/01', '2026/01/00', '0000/01/01']) {
    assert.throws(() => parsePostPath(`${date}/note/index.md`), /Invalid publication date/);
  }
});

test('requires padded folders, lowercase slugs, and supported filenames', () => {
  for (const path of [
    '2026/1/01/note/index.md',
    '2026/01/1/note/index.md',
    '2026/01/01/My-Note/index.md',
    '2026/01/01/my_note/index.md',
    '2026/01/01/note/index_pt.md',
    '2026/01/01/note/extra/index.md',
  ]) assert.throws(() => parsePostPath(path), /Invalid content path/);
});

test('creates stable English and Portuguese URLs', () => {
  assert.equal(postUrl('2026/10/26/note'), '/2026/10/26/note/');
  assert.equal(postUrl('2026/10/26/note', 'pt-BR'), '/2026/10/26/note/pt-br/');
});

test('publication dates do not shift with the server time zone', () => {
  assert.equal(formatDate('2026-01-01'), 'Jan 1, 2026');
  assert.match(formatDate('2026-01-01', 'pt-BR'), /1 de jan/);
});

test('handles an empty blog and deterministic ordering on the same date', () => {
  assert.deepEqual(groupPosts([]), []);
  const posts = groupPosts([entry('2026/10/26/z/index.md'), entry('2026/10/26/a/index.md')]);
  assert.equal(posts[0].path, '2026/10/26/a');
});
