Variations on Zapp
==================

The core Zapp approach is:

- dynamically linked executables
- with dynamic libraries at nearby paths that are relative to the binary
- and the whole thing bundled together into a tarball or zipfile for distribution.

However, there are variations of this possible!

Right now, there's one in particular that's remarkable:

- "[Zapp-splay](#zapps-play)" -- "splay" Zapps are smaller, trimmed down, and provide a way to share and deduplicate data between other "splayed" Zapps... at the cost of increased complexity, in the form of needing to unpack several packages at once before getting a working application.
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

### Delayed fabrication of sharing splays

A Zapp can be transformed into a splay-variant Zapp freely.
This is possible even without access to the source code, or any need to recompile, etc!
It can also be done totally automatically.

[[TODO: addition information required here]]
