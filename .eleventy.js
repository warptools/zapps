
// Maintenance note: this any time something is used once, it is used inline.
//  That includes 'require' statements, wherever possible.  (Most markdownIt plugins can be used this way.)
//  This makes the file easier to reuse if it is forked.
//  (Shifting 'require' statements to the top makes many changes require edits in two positions, for no real functional reason.)

// Short anonymous functions are sometimes declared and then immediately called,
//  purely to provide scope limits and indentation/grouping.

module.exports = function (eleventyConfig) {

	// Decide exactly one way to slugify.
	//  This function is used by the anchor generation, and the TOC generator.
	//   TODO: it may be easier to contain this closer to its effect using the new `eleventyConfig.amendLibrary("md", mdLib => mdLib.enable("code"));` syntax, which arrived in 11ty v2.0.
	const slugify = (s) => {
		// Replace spaces and some other chosen punctuation with dashes.
		// Replace some other leasimp characters likely to get URI-encoded characters with nothing at all.
		// But don't
		return s
			.trim()
			.toLowerCase()
			.replace(/[\s+~/^]/g, "-")
			.replace(/[().`,%·""!?¿:@*]/g, "")
	}

	// Function for the various styles of special containers we will introduce with markdown-it-container.
	//  This must be declared before we get into the rest of the markdown-it configuration because it is used several times.
	//   TODO: it may be easier to contain this closer to its effect using the new `eleventyConfig.amendLibrary("md", mdLib => mdLib.enable("code"));` syntax, which arrived in 11ty v2.0.
	const markdownItContainerCfg = (style) => {
		return {
			render: (tokens, idx, _options, env, slf) => {
				if (tokens[idx].nesting === 1) {
					tokens[idx].attrJoin("class", "callout")
					tokens[idx].attrJoin("class", "callout-" + style)
				}
				return slf.renderToken(tokens, idx, _options, env, slf)
			}
		}
	}

	// Set up the markdown library.
	//  This includes configuring it to use many plugins for various features (TOCs, header links, etc).
	//   Each plugin is configured in its own `.use(...)` call -- they can be added or removed independently.
	eleventyConfig.setLibrary("md", require("markdown-it")({
			html: true,     // Allow html in the markdown.  Disable if your content is not trusted.
			linkify: true,  // Autoconvert URL-like text to links.
			replaceLink: function(link, env) {
				// This function transforms links to `*.md` files in the output.
				//  It allows you to link to source files as they are (and such that links work in e.g. github),
				//  and also work in the directory structure of the output html.
				//  Seealso: https://github.com/11ty/eleventy/issues/1204
				const matcher = new RegExp("^(\./|\.\./|/)(.*?)(.md)(\#.*?)?$");
				if (matcher.test(link)) {
					// Pages with file name index.md are output at a different level in the
					// directory hierarchy than other pages so we need to fix up relative links
					// in those pages to their siblings so they connect.
					const indexPage = env.page.inputPath.endsWith("/index.md");
					const translatedLink = link.replace(matcher, "$1$2$4");
					return indexPage ? translatedLink : translatedLink.replace(/^\.\/(.*?)/, "../$1")
				} else {
					return link;
				}
			}
		})

		// markdown-it-replace-link is required for the replaceLink value above to have effect.
		.use(require('markdown-it-replace-link'))

		// markdown-it-anchor puts page-local anchors onto headings -- a must-have.
		.use(require("markdown-it-anchor"), {
			permalink: true,
			// Don't put any content in the anchor.  We'll add a visual character in CSS instead.
			//  (This is important because the anchor tag is placed inside the hN tag.)
			//  Consider using CSS like: `a.header-anchor:before { float:left; margin-left:-1rem; content:"🔗"; }`.
			permalinkSymbol: "",
			permalinkSpace: false, // Again, please don"t add actual text to the inside of the hN tag.
			permalinkBefore: true,
			// Generate anchors for everything but h1.  h1 tags are for page titles, and are generally not useful to jump to, so don't make anchors for those.
			level: [2, 3, 4, 5, 6],
			// Slugify func.  Must match what's used in the TOC generator.
			slugify,
		})

		// markdown-it-table-of-contents lets you place a TOC in any page by using `[[toc]]`.
		.use(require("markdown-it-table-of-contents"), {
			includeLevel: [2, 3],
			slugify,
			transformLink: (link) => link.replace(/%60/g, "") // remove backticks from markdown code
		})

		// markdown-it-footnote lets you use `[^1]` inline to create footnote links, and `[^1]: the footnote` on a new line later to define it.
		.use(require("markdown-it-footnote"))

		// markdown-it-mark lets you use `==marked==` to highlight text.
		.use(require("markdown-it-mark"))

		// markdown-it-container lets you easily create callouts and other kinds of simple containers in markdown..
		//  We configure it here to support stuff like: `:::tip\nthis is in the tip div\n:::\n`.
		//  It needs to be accompanied by css to highlight `.callout-tip` (or the other keywords we used here).
		.use(require("markdown-it-container"), "warn", markdownItContainerCfg("warn"))
		.use(require("markdown-it-container"), "info", markdownItContainerCfg("info"))
		.use(require("markdown-it-container"), "tip",  markdownItContainerCfg("tip"))
		.use(require("markdown-it-container"), "todo", markdownItContainerCfg("todo"))

		// You may also want to consider yet more plugins, like https://github.com/markdown-it/markdown-it-emoji .
	)

	// This youtube plugin embeds a youtube player whenever it recognizes a youtube-link
	eleventyConfig.addPlugin(require("eleventy-plugin-youtube-embed"))

	// This navigation plugin consumes frontmatter from each page,
	//  and gathers that info into a form that we use to build the nav menu.
	//   You can see an example of this used as global navigation here: https://github.com/ipld/ipld/blob/2f010292da7e3d089f2512b175494abe114f1a2a/.site/_layouts/main.njk#L33-L53
	//   You can see an example of a smaller local insertable here: https://github.com/ipld/ipld/blob/2f010292da7e3d089f2512b175494abe114f1a2a/.site/_includes/listing.njk
	//   In some parts of the above examples, this data configuration was also entangled: https://github.com/ipld/ipld/blob/2f010292da7e3d089f2512b175494abe114f1a2a/.site/_data/eleventyComputed.js#L4-L11
	//   (FUTURE: consider if we can bring those applications together in one place here by using `eleventyConfig.addShortcode` or `eleventyConfig.addFilter` or similar?)
	eleventyConfig.addPlugin(require("@11ty/eleventy-navigation"))

	// Make some functions available as filters -- which means they can be used in nunjucks.
	{
		// Make path manipulation available, so we can use them to create breadcrumbs and other navigation elements.
		//  You can see these used in breadcrumb production here: https://github.com/ipld/ipld/blob/2f010292da7e3d089f2512b175494abe114f1a2a/.site/_layouts/main.njk#L20-L30
		const { dirname, basename } = require("path")
		eleventyConfig.addFilter("dirname", dirname)
		eleventyConfig.addFilter("basename", basename)

		// Make build time available, so we can use it to make sure assets like CSS aren't cached beyond reason.
		//  (This approach is a bit dumb, and will bust caches more than necessary, but is much simpler to implement than content hashing.)
		//  You can invoke this like for example `<link rel="stylesheet" href="/css/style.css?{{ "" | cachebuster }}">` in a njk template.
		const buildtime = new Date().getTime()
		eleventyConfig.addFilter("cachebuster", () => buildtime)
	}

	// Here are all the additional files and folders unique to this site.
	{
		eleventyConfig.addPassthroughCopy('./src/css')
		eleventyConfig.addWatchTarget('./src/css')
		eleventyConfig.addPassthroughCopy('./src/svg')
		eleventyConfig.addWatchTarget('./src/svg')
	}

	return {
		dir: {
			input:  "src",
			output: "_public"
		},
		markdownTemplateEngine: "njk",
	}
}
