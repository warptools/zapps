---
title: "Technology"
layout: base.njk
eleventyNavigation: 
    key: Technology
    order: 1
---
What's in a Zapp?  What makes Zapps special, what can they do that other packaging formats can't, and how do we make them?



What's in a Zapp
----------------

Zapps are still linux executables -- specifically, ELF -- and they're still dynamically linked (there's still `.so` files).

The main difference from usual linking and packaging conventions is that with a Zapp, all the dynamically linked libraries are loaded from a path _relatively to the binary_.
This means that the whole application directory can be _anywhere_ on the filesystem, and you can also _move it around freely_.
(Installing on a jumpdrive?  Sure!)



What can Zapps do?
------------------

Zapps can go anywhere, and they do it without a fuss.

- Zapps can be installed at any filesystem path.
- Zapps can be _moved_ to any filesystem path, too.
- That path doesn't have to be known at compile time!
- That installation can even be on a jumpdrive or other removable media!
- That installation can be on a read-only mount.  No problem.
- Zapps keep working on any system.  They don't depend on system libraries.
- Zapps are still just regular linux applications.  Any linux application can be packaged as a Zapp!




How is a Zapp made?
-------------------

[[TODO]]

- rpath
- XORIGIN
- interplib
- jumploader
