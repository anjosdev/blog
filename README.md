# Vinícius Anjos · Blog

A small static Astro blog, with the typography, colors, and night mode of [anjos.dev](https://anjos.dev). English is the default; individual posts can include a Brazilian Portuguese translation.

## Write a post

Create a directory using a four-digit year, two-digit month/day, and a lowercase, hyphen-separated slug:

```text
content/
  2026/
    10/
      26/
        my-first-post/
          index.md
          index_pt-br.md  # optional
          diagram.png     # optional local image
```

`index.md` is the required English version. Each file starts with YAML frontmatter:

### Portuguese translations

Add `index_pt-br.md` in the same directory, with its own title, optional description, and translated body. A translation must have an English counterpart.

- English: `/2026/10/26/my-first-post/`
- Portuguese: `/2026/10/26/my-first-post/pt-br/`
