import { test, expect } from '@playwright/test';

const english = '/2026/10/26/my-first-post/';
const portuguese = `${english}pt-br/`;
const englishOnly = '/2026/10/25/keep-it-simple/';

test('homepage lists each post once, newest first, and links to English', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Blog — Vinícius Anjos');
  await expect(page.locator('.post-list a')).toHaveText(['My first post', 'Keep it simple']);
  await expect(page.locator('.post-list a').first()).toHaveAttribute('href', english);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
  await expect(page.locator('.language-switch')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://blog.anjos.dev/');
});

test('translation links work both ways with localized metadata and dates', async ({ page }) => {
  await page.goto(english);
  await expect(page.locator('.language-switch a[aria-current="page"]')).toHaveText('EN-US');
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(2);
  await page.getByRole('link', { name: 'PT-BR', exact: true }).click();
  await expect(page).toHaveURL(portuguese);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meu primeiro post');
  await expect(page.locator('time')).toHaveText('26 de out. de 2026');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://blog.anjos.dev${portuguese}`);
  await page.getByRole('link', { name: 'EN-US', exact: true }).click();
  await expect(page).toHaveURL(english);
});

test('English-only posts have no translation links or generated Portuguese page', async ({ page, request }) => {
  await page.goto(englishOnly);
  await expect(page.locator('.language-switch')).toHaveCount(0);
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
  const response = await request.get(`${englishOnly}pt-br/`);
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('Page not found');
});

test('Markdown renders headings, lists, blockquotes, links, code, tables, and local images', async ({ page, request }) => {
  await page.goto(english);
  await expect(page.locator('.prose h2')).toHaveCount(2);
  await expect(page.locator('.prose ul li')).toHaveCount(3);
  await expect(page.locator('.prose blockquote')).toBeVisible();
  await expect(page.locator('.prose pre code')).toContainText('from pathlib import Path');
  await expect(page.locator('.prose .astro-code span[style]')).not.toHaveCount(0);
  await expect(page.locator('.prose a')).toHaveAttribute('href', 'https://anjos.dev');
  await page.goto(englishOnly);
  await expect(page.locator('.prose table tbody tr')).toHaveCount(3);
  const image = page.getByRole('img', { name: 'Three connected steps: ask, try, and learn.' });
  await expect(image).toBeVisible();
  expect(await image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const imageUrl = await image.getAttribute('src');
  expect(imageUrl).toBeTruthy();
  expect((await request.get(imageUrl!)).ok()).toBe(true);
});

test('theme starts light, persists across navigation and reload, and toggles back', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.theme-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#232136');
  await page.getByRole('link', { name: 'My first post', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('theme remains usable when storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } });
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
});

test('posts and language navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4322${english}`);
  await expect(page.locator('.prose')).toContainText('This is a place for those notes.');
  await expect(page.locator('.theme-toggle')).toBeHidden();
  await page.getByRole('link', { name: 'PT-BR', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meu primeiro post');
  await page.getByRole('link', { name: '← Voltar ao blog' }).click();
  await expect(page.locator('.post-row')).toHaveCount(2);
  await context.close();
});

test('keyboard users can skip to content and activate the theme control', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.locator('.theme-toggle').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

for (const width of [360, 768, 1280]) {
  test(`layouts fit a ${width}px viewport in both themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', english, englishOnly, portuguese]) {
      await page.goto(route);
      for (let theme = 0; theme < 2; theme++) {
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const title = await page.locator('h1').boundingBox();
        const toggle = await page.locator('.theme-toggle').boundingBox();
        expect(title && toggle && (title.y >= toggle.y + toggle.height || title.x + title.width <= toggle.x)).toBeTruthy();
        await page.locator('.theme-toggle').click();
      }
    }
  });
}
