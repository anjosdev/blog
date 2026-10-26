import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://blog.anjos.dev',
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'rose-pine-moon' },
      defaultColor: false,
    },
  },
});
