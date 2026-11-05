import rss from '@astrojs/rss';
import { getNews, SITE } from '../lib/site';

export async function GET(context) {
  const news = await getNews();
  return rss({
    title: `${SITE.name} news`,
    description: SITE.description,
    site: context.site,
    items: news.map((post) => ({
      title: post.data.title,
      description: post.data.dek,
      pubDate: post.data.date,
      link: `/news/${post.id}/`,
    })),
  });
}
