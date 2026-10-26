export type Language = 'en-US' | 'pt-BR';

export interface PostEntry {
  id: string;
  data: { title: string; description?: string };
}

export interface Post<T extends PostEntry = PostEntry> {
  path: string;
  date: string;
  year: string;
  english: T;
  portuguese?: T;
}

export function parsePostPath(file: string) {
  const match = /^(\d{4})\/(\d{2})\/(\d{2})\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(index|index_pt-br)\.md$/.exec(file);
  if (!match) {
    throw new Error(`Invalid content path: content/${file}. Use YYYY/MM/DD/lowercase-post-slug/index.md (or index_pt-br.md), with two-digit months and days.`);
  }
  const [, year, month, day, slug, filename] = match;
  const date = `${year}-${month}-${day}`;
  const timestamp = new Date(`${date}T00:00:00Z`);
  if (year === '0000' || Number.isNaN(timestamp.getTime()) || timestamp.toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid publication date in content/${file}: ${date}. Use a real calendar date.`);
  }
  return {
    path: `${year}/${month}/${day}/${slug}`,
    date,
    year,
    language: filename === 'index' ? 'en-US' as const : 'pt-BR' as const,
  };
}

export function groupPosts<T extends PostEntry>(entries: T[]): Post<T>[] {
  const groups = new Map<string, Omit<Post<T>, 'english'> & { english?: T }>();
  for (const entry of entries) {
    const { path, date, year, language } = parsePostPath(entry.id);
    const post = groups.get(path) ?? { path, date, year };
    const key = language === 'en-US' ? 'english' : 'portuguese';
    if (post[key]) throw new Error(`Duplicate ${language} post in content/${path}.`);
    post[key] = entry;
    groups.set(path, post);
  }
  const posts = [...groups.values()].map((post): Post<T> => {
    if (!post.english) {
      throw new Error(`Missing English post: add content/${post.path}/index.md alongside index_pt-br.md.`);
    }
    return { ...post, english: post.english };
  });
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path));
}

export function postUrl(path: string, language: Language = 'en-US') {
  return `/${path}/${language === 'pt-BR' ? 'pt-br/' : ''}`;
}

export function formatDate(date: string, language: Language = 'en-US') {
  return new Intl.DateTimeFormat(language, {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
