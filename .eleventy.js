const markdownIt = require('markdown-it')

// inspired by
// https://github.com/ipld/ipld/blob/8986845c109528def2448bfbbf4c716fd86d693c/.site/.eleventy.js
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('./src/css')
  eleventyConfig.addPassthroughCopy('./src/svg')
  eleventyConfig.addWatchTarget('./src/css')
  eleventyConfig.addPlugin(require('@11ty/eleventy-navigation'))

  const slugify = (s) => {
    // Slugs should not contain URI-encoded characters (which is the default); just get rid of them.
    return s
      .trim()
      .toLowerCase()
      .replace(/[\s+~/^]/g, '-')
      .replace(/[().`,%·'"!?¿:@*]/g, '')
  }

  const markdownLibrary = markdownIt({
    html: true,
    linkify: true
  }).use(require('markdown-it-anchor')  )

  eleventyConfig.setLibrary('md', markdownLibrary)

  // This navigation plugin consumes frontmatter from each page,
  //  and gathers that info into a form that we use to build the nav menu.

  return {
    dir: { input: 'src', output: 'public' },
    markdownTemplateEngine: 'njk'
  }
}
