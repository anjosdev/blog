import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parsePostPath } from './lib/posts';

const posts = defineCollection({
  loader: glob({
    base: './content',
    pattern: '**/index{,_pt-br}.md',
    generateId: ({ entry }) => {
      parsePostPath(entry);
      return entry;
    },
  }),
  schema: z.object({
    title: z.string().trim().min(1, 'Add a non-empty title to the YAML frontmatter.'),
    description: z.string().trim().min(1).optional(),
  }),
});

export const collections = { posts };
