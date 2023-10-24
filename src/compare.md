---
title: "Tradeoffs and Comparisons"
layout: base.njk
eleventyNavigation:
    key: Compare
    order: 20
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

Reason 2: There's a Zapp variant that addresses this -- See the docs on the [Zapp-splay Variation](/variations.md#zapp-splay).
Splayed Zapps can be just as compact as normal applications -- they're totally suitable even on embedded devices or other scenarios with severely limited disk space availability.




How is this different from...?
------------------------------

### Difference from traditional linux packaging (apt, deb, yum, rpm, etc)?

Zapps are a packaging format meant to work anywhere; they're not trying to be a system package manager.

As a result, Zapps are *drastically* less complicated than anything trying to be a system package manager.
Zapps are also focused on being something you can do yourself, and distribute without asking permission.

The install process for a Zapp is "untar".  Or "unzip".  Or un-whatever-your-packing-format-was.  Then just "use".
This is the entire install process for a Zapp; they don't need any further support.

Most traditional linux package managers are considerably more complicated because
they expect to own and manage the whole system,
they have strong opinions about how shared libraries should be shared,
they're also functioning as a store for discovery of packages, and so on -- and they combine all these tasks in one thing.
Zapps are targetting a much more specific set of goals -- just ship applicatons, nothing else -- and so are almost incomparably simpler.


### Difference from AppImage

Zapps and AppImage have the same goals:
users should experience simple installation,
and developers should experience simple one-investment-then-it-goes-anywhere packaging.
AppImage is definitely closer to Zapps than anything else in this comparisons page!

Zapps and AppImage differ in the technical details of how we do it;
differ in that AppImage requires a bit more from the host (namely, mounting permissions);
and differ in that Zapps make it possible to deduplicate content, while AppImage makes that nearly impossible.

- **file vs files:**
  AppImage puts considerable emphasis on putting all content in "one file".
  Zapps do not.  Zapps expect to be extracted onto the filesystem, and can contain multiple files.

- **requirements from the host:**
  AppImage requires more from the host system than Zapps.
  Zapps are... just files.
  AppImage requires mounting a squashFS (as part of satisfying their "one file" goal).
  (Typically, on modern systems, this is not a big issue -- it's usually allowed as a low-priviledge operation, and doesn't require special setup.
  Nonetheless, this requirement sometimes causes issues.  For example, requesting mounting inside containers can be a problem!)

- **deduplication:**
  Dymamic libraries and shared data in Zapps can be deduplicated, because they're just files.
  There are multiple ways to approach this: a filesystem with dedup will acheive it naturally, or, [symlinks can be used](variations.md#zapp-splay) to deduplicate common files.
  In AppImage, deduplication and sharing of data is blocked by the all-in-one file pattern:
  because the squashFS image is a single file, the simple techniques that work for Zapps don't work for AppImage files.

So we think Zapps are a little simpler, a little more flexible, and just generally a bit better.
All that said:
Both systems work!
And both systems _do_ satisfy the critical definition of being usable as path-agnostic executables.
So AppImage is still pretty cool, in our opinion.


### Difference from Containers

Zapps are for individual applications; containers are for whole system images.


You can compose Zapps easily.  You can put many, many Zapps on your system, and call each of them like a normal executable.

Containers, even if used to contain single applications, have one major drawback: _containers can't be composed_.
If you have a container for the "foo" application, and it wants to call the "bar" application, what do you do?
Broadly speaking, you have to run two containers and coordination a shared filesystem somehow;
or, you build one bigger container image with both applications.
Containers don't make composition easy.

So, in general, we would say Zapps are much more flexible than containers, because you can easily put Zapps wherever you want,
and there's nothing weird or complicated about Zapps calling other Zapps -- they're just executables; that's it.

(And you can put Zapps in containers.  Obviously.)


### Difference from static linking

Zapps still use dynamic linking.  But they're as portable as static linking!

Because Zapps bundle all their libraries together, they're portable -- which is the main thing that's generally considered desirable about static linking.

It's also still possible to deduplicate the libraries used by a zapp, and share them -- which is not possible with static linking.
The baseline Zapps don't do this, but the [Zapp-splay Variation](/variations.md#zapp-splay) does -- and those can be produced without re-compiling, which is a pretty great power to have.

Zapps are generally easier to produce than static linking.
(Static linking can require correct support from upstream libraries; usually, it works.  When it doesn't?  You can be pretty far up a creek and left without very usable paddle, because the problems might not even be in code that you own yourself.)

Because Zapps are doing dynamic linking in a very normal way, it means they also support delayed dymanic loading, too, with no fuss.
If an application packaged as a Zapp wants to load libraries after main program initialization, e.g., for some kind of plugin system... It just works.
No special effort; no special cases.

### Difference vs other distribution platforms

There are several other recent package management systems that aren't quite the "traditional" linux package managers,
like apt/deb/yum/rpm that we covered earlier.
Flatpak, Snaps, and a few others can fall into this group.
Partially these are distinguished by sheer age (they're new kids on the block, relatively speaking --
so people ask for comparisons to them, just because they're fun to ask about),
and typically also practically distinguished by the fact they're not trying to be "system" package managers
(e.g. they don't expect to be the thing that helps you boot; they expect to share the host with another package manager).

As with the other system package managers, the main difference between Zapps and any of these systems is:
Zapps are _just a packaging format_.  These other systems are whole "stores", and distribution strategies, and so on.

And: yeah, most of these other platforms still expect to be installed with sudo, at a specific path.
And thereafter, they're a platform tool, of which there is now one on your system.
Zapps have neither requirement (don't need sudo, don't need any particular path), and aren't a platform and thus don't require a platform management tool on your host.
Zapps are just a thing you use, however you want.

(We don't have super fine-grained comparisons to these; PRs are welcome.)

#### Difference vs Flatpak

Flatpak is a whole platform.  Zapps are focused on being a simple way to distribute single applications, without needing a platform.

The usual way to interact with flatpack is by running a "flatpak install" command.
This does lots of things, including taking a package name as a parameter,
looking up what that name resolves to,
figuring out transitive dependencies of it,
and installing all of these on your system,
along with interactive prompts about whether these actions are okay.
It even includes some permission management systems,
and tracks the state of packages installed with flatpak so it can advise you about updates.

Zapps are none of these things.  Zapps are focused on a much smaller, simpler problem: just shipping you a single piece of software.

Flatpak, like any tool of the style that wants to manage a system, is not designed to work on read-only media,
nor does it handle content in a way that will be portable without additional invocations of the flatpak tooling to modify the content.
By contrast, Zapps never need modification in order to be relocated; Zapps are made to be relocatable from the start.


#### Difference vs Snaps

Snaps are a whole platform.  Zapps are focused on being a simple way to distribute single applications, without needing a platform.

Most of the same observations that applied for Flatpak seem to apply for Snaps.
(A more detailed comparison would be a welcome PR.)
