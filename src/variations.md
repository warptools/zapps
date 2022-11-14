---
title: "Variations"
layout: base.njk
eleventyNavigation: 
    key: Variations 
    order: 30
---
The core Zapp approach is:

- dynamically linked executables
- with dynamic libraries at nearby paths that are relative to the binary
- and the whole thing bundled together into a tarball or zipfile for distribution.

However, there are variations of this possible!

Right now, there's one in particular that's remarkable:

- "[Zapp-splay](#zapp-splay)" -- "splay" Zapps are smaller, trimmed down, and provide a way to share and deduplicate data between other "splayed" Zapps... at the cost of increased complexity, in the form of needing to unpack several packages at once before getting a working application.
- ... this list may grow in the future!  Community ideas are welcome :)



Zapp Splay
----------

Zapps packaged in "splay" form don't contain _all_ of their own data in a single bundle.
They need multiple packages to be unpacked together in nearby paths in order to work.
This means they're an increase in complexity over basic Zapps, but in exchange,
means that a system using lots of Zapps can save a significant amount of disk space when data is shared.

Splayed Zapps still keep the other goals of Zapps intact -- especially, that they're still easy to "install" with zero operations other than "unpack".
(While a "splayed" Zapp might require more than one "unpack" operation to become functional, it still _only_ requires the "unpack" operation -- there's still no "post-install hooks" that might take arbitrary actions.)

### Zapp Splay: Tech

tl;dr: symlinks.

Slightly less tl;dr: symlinks with content-addressed target paths.

[[TODO: addition information required here]]

For a recommendation on which hashing to use:
see [Appendix: What hashing scheme shall we use?](#appendix-what-hashing-scheme-shall-we-use)



### Delayed fabrication of sharing splays

A Zapp can be transformed into a splay-variant Zapp freely.
This is possible even without access to the source code, or any need to recompile, etc!
It can also be done totally automatically.

[[TODO: addition information required here]]



#### Appendix: What hashing scheme shall we use?

For the purpose of share splays, any hashing scheme will do.

The one trick is: it's best if everyone you'd like to share content with agrees on _the same one_.

We'll recommend a concrete answer: **let's use the git tree hashing, in sha256 mode.**

Why?

- it hashes full filesystem trees -- obviously essential
- it hashes the important posix bits -- the executable bit -- and it supports symlinks
- it doesn't hash anything _else_ -- for library sharing, you don't care about ownership bits, etc!

In other words, it fits the ticket rather precisely.
And because it's already well-standardized and widely used due to git's ubiquity,
we can all just skip a bikeshed here.

We've rolled out [a treehash tool](https://github.com/warptools/gittreehash) that does exactly this.

