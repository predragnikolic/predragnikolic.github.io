import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const postsDir = './';

/**
 * @typedef {{
 *  slug: string
 *  title: string
 *  description: string
 *  date: string
 *  image: string
 *  tags: string[]
 * }} Meta
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {Meta[]} */
const metas = []
readdirSync(postsDir).forEach(file => {
    if (!file.endsWith('html')) return

    const fullPathToFile = path.join(__dirname, file)
    const content = readFileSync(fullPathToFile, { encoding: 'utf8' });

    const unparsedMeta = content.match(/(.*#:369:#)/gms)[0]
    const meta = parseMeta(unparsedMeta)
    console.log(meta)
    metas.push(meta)
    // create html post
    const layout = readFileSync(path.join(__dirname, 'base', 'layout.html'), { encoding: 'utf8' })
    const htmlContent = content.replace(unparsedMeta + "\n", "")
    const gluedTogetherBlogPost = layout.replace('<!-- REPLACE ME WITH JS -->', htmlContent)
    writeFileSync(`../blog/${meta.slug}.html`, gluedTogetherBlogPost);
});


// create rss feed
const rssItems = []
metas.forEach(meta => {
  const categories = meta.tags.map(tag => `<category>${tag}</category>`).join('\n')
  rssItems.push(`<item>
    <title>${meta.title}</title>
    <link>https://predrag.pro/blog/${meta.slug}.html</link>
    <description>${meta.description}</description>
    <author>${meta.author}</author>
    <pubDate>${meta.date}</pubDate>
    <image><url>${meta.image}</url></image>
    ${categories}
  </item>`)
})
const baseRss = readFileSync(path.join(__dirname, 'base', 'rss.xml'), { encoding: 'utf8' })
const gluedTogetherRssFeed = baseRss.replace('<!-- REPLACE ME WITH JS -->', rssItems.join('\n'))
writeFileSync(`../rss.xml`, gluedTogetherRssFeed);


/**
 * @param      {string}  unparsedMeta  The unparsed meta
 * @return     {Meta}  The Meta (not facebook meta (:)
 */
function parseMeta(unparsedMeta) {
  const lines = unparsedMeta.split('\n').filter(line => !line.includes("#:369:#"))
  /** @type {Partial<Meta>} */
  const meta = {
    author: 'Predrag Nikolic',
    tags: []
  }
  for (let line of lines) {
    const [key, value] = line.split(': ', 2)
    meta[key] = value.trim()

    if (key === 'tags') {
      const tags = value.split(',').map(tag => tag.trim())
      meta[key] = tags
    }
  }

  const presentKeys = Object.keys(meta)
  const requiredMetaKeys = ['slug', 'title', 'description', 'date', 'tags', 'image']
  requiredMetaKeys.forEach(requiredKey => {
    if (!presentKeys.includes(requiredKey)) throw Error(`Missing meta: ${requiredKey}`)
  })
  return meta
}