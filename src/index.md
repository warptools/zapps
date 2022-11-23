---
title: "Zero-Dependency Applications"
layout: base.njk
---
Zapps are an application packaging format for Linux.

For users, they provide simplicity and freedom: a Zapp can be installed in any location, on any linux distribution, and will "just work".
Zapps can run fine directly from a jumpdrive, or, even varying versions of the same application can be easily used on the same computer with no fuss.

For developers and packagers, Zapps also provide simplicity: do the work to package something as a Zapp just one time,
and now you have a package anyone can use, anywhere.
No distro-specific worries; and users can always get the latest version of the application, direct from you.

Less is more.  Zapps are as simple as we can make them.


- [Technology](#technology)
- [Demos](#demos)
- [Media](#media)
- [Tradeoffs](#tradeoffs)
- [Variants](#variants)
- [Join the Community!](#join-the-community)


Technology
----------

Read more about the [Zapp Technology](/technology.md) in depth here.


Demos!
------

If you want to download and run a Zapp today, here are some of our favorites:

- [Bash](https://catalog.warpsys.org/warpsys.org/bash/_releases/v5.1.16-2.html)
- [Python](https://catalog.warpsys.org/warpsys.org/python/_releases/v3.10.4.html)
- [Helix](https://catalog.warpsys.org/warpsys.org/helix/_releases/22.05.html)

(These are links to a Warpforge Catalog website -- so you can choose from the download links there,
and also, you can follow the "replay" link to see how these packages were built!)

In these demos, you can see both language interpreters and system tools, and sizable applications.
And you may also notice that both C and Rust projects are represented here:
Zapp-style packaging is a general technique for any linux executables, regardless of source language!


Media
-----

Zapps were presented in 2022 at an event called IPFS Camp.  You can find the recording here:

https://www.youtube.com/watch?v=Q33LgKAwpZU



Tradeoffs
---------

> Does the Zapp format have tradeoffs or drawbacks?

Everything has tradeoffs.

_However_.

We consider most of them to be either "worth it", or "mitigated".

See more in the [deeper docs about tradeoffs](/compare.md#tradeoffs).

We also [compare](/compare.md#how-is-this-different-from) Zapps to several alternative approaches in that doc!


Variants
--------

The core Zapp standard is meant to be utterly simple, foolproof, and portable.

However, there are a few variations!  These generally trade some complexity in order to satisfy some other goals, or make more efficient or more compact packages.

Check out the [Variant docs](/variations.md)!


Join the Community
------------------

Zapps grew out of the work on [Warpforge](http://warpforge.io/)!
We develop the spec alongside the Warpforge and Warpsys projects.

We'd love to have you join our [community](https://warpforge.notion.site/Community-676332742afa4276be571f7d035d55db)!

- If you're interested in Zapps -- come!
- If you're interested in adopting Zapps as someone who ships software -- join us!
- If you're using Zapps and need support -- we're happy to hear from you!  (We certainly hope it Just Works, though ;))

Our primary chat is in [Matrix](https://matrix.to/#/#warpforge:matrix.org).

You can also find the chat bridged to Libera IRC.
If you don't want to use Matrix, and you also don't have a preferred IRC client, you can use [this one](https://web.libera.chat/gamja/#warpforge).

This spec's source code is on our [Github repository](https://github.com/warptools/zapps).
