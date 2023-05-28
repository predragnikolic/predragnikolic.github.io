import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @typedef {{
 *  slug: string
 *  author: string
 *  title: string
 *  description: string
 *  date: string
 *  image?: string
 *  tags: string[]
 * }} Meta
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = './src';
/** @type {Meta[]} */
let metas = []
readdirSync(postsDir).forEach(file => {
    if (!file.endsWith('html')) return

    const fullPathToFile = path.join(postsDir, file)
    const content = readFileSync(fullPathToFile, { encoding: 'utf8' });
    console.log({ content })

    const meta = parseMeta( content, file)
    metas.push(meta)
    // create html post
    const metaContent = `
      <meta name='author' content='${meta.author}'>
      <meta name='description' content='${meta.description}'>
      <meta name='keywords' content='${meta.tags.join(', ')}'>
      <meta name='date' content='${meta.date}'>

      <meta name='og:title' content='${meta.title}'>
      <meta name='og:url' content='https://predrag.pro/cita/${meta.slug}'>
      ${ meta.image ? `<meta name='og:image' content='${meta.image}`: ''}
      <meta name='og:site_name' content='predrag.pro'>
      <meta name='og:description' content='${meta.description}'>
    `
    const layout = readFileSync(path.join(postsDir, 'base', 'layout.html'), { encoding: 'utf8' })
    const titleAndDecription = `
      <h1 class="blog_title">${meta.title}</h1>
      <p class="blog_description">${meta.description}</p>
    `

    const gluedTogetherBlogPost = layout
      .replace('<!-- REPLACE ME WITH TITLE AND DESCRIPTION JS -->', titleAndDecription)
      .replace('<!-- REPLACE ME WITH JS -->', content)
      .replace('<!-- ADD META WITH JS -->', metaContent)
    writeFileSync(`./cita/${meta.slug}`, gluedTogetherBlogPost);
});

metas = metas.sort((a, b) => new Date(a.date) > new Date(b.date))

// create rss feed
const rssItems = []
metas.forEach(meta => {
  const categories = meta.tags.map(tag => `<category>${tag}</category>`).join('\n')
  rssItems.push(`<item>
    <title>${meta.title}</title>
    <link>https://predrag.pro/cita/${meta.slug}</link>
    <description>${meta.description}</description>
    <author>${meta.author}</author>
    <pubDate>${meta.date}</pubDate>
    ${categories}
  </item>`)
})
const baseRss = readFileSync(path.join(postsDir, 'base', 'rss.xml'), { encoding: 'utf8' })
const gluedTogetherRssFeed = baseRss.replace('<!-- REPLACE ME WITH JS -->', rssItems.join('\n'))
writeFileSync(`./rss.xml`, gluedTogetherRssFeed);

/**
 * @param      {string}  content  The unparsed meta
 * @return     {Meta}    The Meta (not facebook meta (:)
 */
function parseMeta(content, slug) {
  const title = content.match(/<title>(.*)<\/title>/)[1]
  if (!title) throw Error("Title tag is missing.")
  const description = content.match(/['"]description['"]\scontent=['"](.+)['"]\s?>/)[1]
  if (!description) throw Error("<meta name='description' content='*'> missing")
  const tags = content.match(/['"]keywords['"]\scontent=['"](.+)['"]\s?>/)[1].split(',').map(tag => tag.trim())
  if (!tags) throw Error("<meta name='tags' content='*'> missing")
  const date = content.match(/['"]date['"]\scontent=['"](.+)['"]\s?>/)[1]
  if (!date) throw Error("<meta name='date' content='*'> missing")
  /** @type {Meta} */
  const meta = {
    slug,
    author: 'Predrag Nikolic',
    title,
    description,
    date,
    tags: []
  }
  return meta
}