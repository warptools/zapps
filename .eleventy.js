const CleanCSS = require('clean-css')
module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles
  })
  eleventyConfig.addPassthroughCopy('./src/css')
  eleventyConfig.addWatchTarget('./src/css')
  return {
    dir: { input: 'src', output: 'public' }
  }
}
