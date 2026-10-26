import { getCollection } from 'astro:content';
import { groupPosts } from './posts';

export async function getPosts() {
  return groupPosts(await getCollection('posts'));
}
