import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @typedef {{
 *  slug: string
 *  author: string
 *  title: string
 *  description: string
 *  date: string
 *  image?: string
 *  tags: string[]
 *  content: string
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

    const meta = parseMeta( content, file)
    metas.push(meta)
    // create html post
    const metaContent = `
      <meta name='author' content='${meta.author}'>
      <meta name='description' content='${meta.description}'>
      <meta name='keywords' content='${meta.tags.join(', ')}'>
      <meta name='date' content='${meta.date}'>

      <meta name='og:title' content='${meta.title}'>
      <meta name='og:url' content='https://predragnikolic.github.io/blog/${meta.slug}'>
      ${ meta.image ? `<meta name='og:image' content='${meta.image}`: ''}
      <meta name='og:site_name' content='predragnikolic.github.io'>
      <meta name='og:description' content='${meta.description}'>
    `
    const layout = readFileSync(path.join(postsDir, 'base', 'layout.html'), { encoding: 'utf8' })
    const titleAndDecription = `
      <h1 class="blog_title">${meta.title}</h1>
      <div class='flex blog_meta flex-wrap' style='gap: 10px'>
        ${new Intl.DateTimeFormat('en', {month: 'long', year: 'numeric', day: 'numeric'}).format(new Date(meta.date))}
        ${meta.tags.length ? "<span>-</span>": '' }
        ${meta.tags.map(tag => `<div class="tag">${tag}</div>`).join('')}
      </div>
      <p class="blog_description">${meta.description}</p>
    `

    const gluedTogetherBlogPost = layout
      .replace('<!-- {{TITLE_DESCRIPTION}} -->', titleAndDecription)
      .replace('<!--  {{BLOG_POST}}  -->', content)
      .replace('<!-- {{BLOG_META}}-->', metaContent)
    writeFileSync(`./blog/${meta.slug}`, gluedTogetherBlogPost);
});

metas = metas.sort((a, b) => new Date(a.date) > new Date(b.date))

// create rss feed
const rssItems = []
metas.forEach(meta => {
  const categories = meta.tags.map(tag => `<category>${tag}</category>`).join('\n')
  rssItems.push(`<item>
    <guid isPermaLink="false">${meta.slug}</guid>
    <title>${meta.title}</title>
    <link>https://predragnikolic.github.io/blog/${meta.slug}</link>
    <description>${meta.description}</description>
    <author>${meta.author}</author>
    <pubDate>${new Date(meta.date).toUTCString()}</pubDate>
    ${categories}
    <content:encoded><![CDATA[
    ${meta.content}
    ]]></content:encoded>
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
  const [fullTitleMatch, title] = content.match(/<title>(.*)<\/title>/)
  if (!title) throw Error("Title tag is missing.")
  content = content.replace(fullTitleMatch, '')
  const [fullDescriptionMatch, description] = content.match(/<meta.+['"]description['"]\scontent=['"](.+)['"]\s?>/)
  if (!description) throw Error("<meta name='description' content='*'> missing")
  content = content.replace(fullDescriptionMatch, '')
  let [fullTagsMatch, tags] = content.match(/<meta.+['"]keywords['"]\scontent=['"](.+)['"]\s?>/) || [undefined, '']
  content = content.replace(fullTagsMatch, '')
  tags = tags.split(',').map(tag => tag.trim()).filter(Boolean)
  const [fullDateMatch, date] = content.match(/<meta.+['"]date['"]\scontent=['"](.+)['"]\s?>/)
  if (!date) throw Error("<meta name='date' content='*'> missing")
  content = content.replace(fullDateMatch, '')

  content = content.trim()
  /** @type {Meta} */
  const meta = {
    slug,
    author: 'Предраг Николић',
    title,
    description,
    date,
    tags,
    content
  }
  return meta
}
