---
title: "Tradeoffs and Comparisons"
layout: base.njk
eleventyNavigation:
    key: Compare
    order: 2
---
Tradeoffs
---------

Everything has tradeoffs.

Zapps have some, too.

### Size

The main tradeoff that Zapps make is size, in exchange for simplicitly and portability.
Because a Zapp bundles all its dependencies -- all its libraries, everything -- they can become rather large.

However, we don't typically see this as a problem.  Two reasons:

Reason 1: Simply put, _users typically don't care_.  Many desktop applications these days bundle an entire Electron instance, becoming hundreds of megabytes.
And what have we learned from that?  _Users accept that, because it provides value -- it works_.  Zapps inhabit that same space: "just works" is more important than "kinda big".

Reason 2: There's a Zapp variant that addresses this -- See the docs on the [Zapp-splay Variation](/variations#zapp-splay).
Splayed Zapps can be just as compact as normal applications -- they're totally suitable even on embedded devices or other scenarios with severely limited disk space availability.




How is this different from...?
------------------------------

### Difference from traditional linux packaging (apt, deb, yum, rpm, etc)?

Zapps aim to be *drastically* less complicated than almost all other packaging systems.

The install process is "untar".  Or "unzip".  Or un-whatever-your-packing-format-was.  Then just "use".

Zapps don't generally require post-install hooks to function.
In fact, it's a key goal of Zapps that they should run just fine even when mounted on a read-only filesystem.
Most traditional linux package managers expect to use post-install hooks freely, and tend not to be very viable on ready-only filesystems.


### Difference from AppImage

Zapps and AppImage have the same goals:
users should experience simple installation,
and developers should experience simple one-investment-then-it-goes-anywhere packaging.

Zapps and AppImage differ in technique; differ in one of their goals; and differ in that AppImage requires a bit more from the host (namely, mounting permissions).

AppImage puts considerable emphasis on putting all content in "one file".
Zapps do not.  Zapps expect to be extracted onto the filesystem, and can contain multiple files.

AppImage requires more from the host system than Zapps.
Zapps are... just files.
AppImage requires mounting a squashFS (as part of satisfying their "one file" goal).
(Typically, on modern systems, this is not a big issue -- it's usually allowed as a low-priviledge operation, and doesn't require special setup.
Nonetheless, it does require this support to be present.)

Dymamic libraries and shared data in Zapps can be deduplicated (although in the simplest, default modes, they are not).
In AppImage, deduplication and sharing of data simply is not possible: the all-in-one nature of the squashFS technique removes the possibility completely.

All that said:
Both systems work!
And both systems _do_ satisfy the critical definition of being usable as path-agnostic executables.


### Difference from Containers

Zapps are for individual applications.
You can compose Zapps easily.  You can put many, many Zapps on your system, and call each of them like a normal executable.

Containers are (generally speaking) whole system images.  They tend to be really big; and they _can't be composed_.

As a result of this, Zapps are much more flexible than containers.
There's no barriers to freely composing Zapps into suites that play together, even totally on the fly.


### Difference from static linking

Zapps still use dynamic linking.  But they're as portable as static linking!

Because Zapps bundle all their libraries together, they're portable -- which is the main thing that's generally considered desirable about static linking.

It's also still possible to deduplicate the libraries used by a zapp, and share them -- which is not possible with static linking.
The baseline Zapps don't do this, but the [Zapp-splay Variation](/variations#zapp-splay) does -- and those can be produced without re-compiling, which is a pretty great power to have.

Zapps are generally easier to produce than static linking.
(Static linking can require correct support from upstream libraries; usually, it works.  When it doesn't?  You can be pretty far up a creek and left without very usable paddle, because the problems might not even be in code that you own yourself.)

Because Zapps are doing dynamic linking in a very normal way, it means they also support delayed dymanic loading, too, with no fuss.
If an application packaged as a Zapp wants to load libraries after main program initialization, e.g., for some kind of plugin system... It just works.
No special effort; no special cases.
