---
title: "Technology"
layout: base.njk
eleventyNavigation: 
    key: Technology
    order: 10
---
What's in a Zapp?  What makes Zapps special, what can they do that other packaging formats can't, and how do we make them?



What's in a Zapp
----------------

Zapps are still linux executables -- specifically, ELF -- and they're still dynamically linked (there's still `.so` files).

(This is good.  It means Zapps aren't "weird" in any way.  There aren't any gnarly edgecases waiting to jump out at you.)

The main difference from usual linking and packaging conventions is that with a Zapp, all the dynamically linked libraries are loaded from a path _relatively to the binary_.
This means that the whole application directory can be _anywhere_ on the filesystem, and you can also _move it around freely_.

So: Running a Zapp straight off a USB stick?  Sure!
It just works.



What can Zapps do?
------------------

Zapps can go anywhere, and they do it without a fuss.

- Zapps can be installed at any filesystem path.
- Zapps can be _moved_ to any filesystem path, too.
- That path doesn't have to be known at compile time!
- That installation can even be on a jumpdrive or other removable media!
- Zapps can be run from a read-only mount -- No problem.
- Zapps keep working on any system.  They don't depend on system libraries.
- Zapps are still just regular linux applications.  Any linux application can be packaged as a Zapp!  And typically, the changes to the compilation process are minimal and noninvasive.
- Zapps don't ask anything special from the kernel for this, either.  No kernel mods.  Not even a demand for mounting.  They're just files.

Broadly: Zapps are about the most portable thing we can imagine.  They depend only on the kernel and the machine architecture.  Nothing else.



How is a Zapp made?
-------------------

Most of the process of compiling a program when you want to produce a Zapp is the same as usual.
You still use GCC, or whatever other compiler you like.
The divergences come in the linker stage.
(Of course, you may end up communicating the linker instructions through makefiles or other indirections; C ecosystems are fun, aren't they?)

The are three sources we can offer right now for more information:

- You can see how Zapps are built in the Replay documents where we've built them using Warpforge!  [See here, for example.](https://catalog.warpsys.org/warpsys.org/bash/_replays/zM5K3Vgei44et6RzTA785sEZGwuFV75vCazjhR11RH5veFdMTx7F5cg2c4NA5HXPK8Zv5TQ.html)
- You can read the longform story, below.
- Or you can try to use the generic tools we've made for automatically building Zapps... except, they don't exist yet.  Sorry.
	- If you want to work on this, pleaseplease get in touch with us!  (See the [community](https://warpforge.notion.site/Community-676332742afa4276be571f7d035d55db) links page)


The Story of Zapp Internals
---------------------------

Here's the long-form story of what goes into producing a Zapp (and why).

We don't have full copy-paste ready instructions here, but from this guidance, you should be able to figure out a way.

### The Four Key Tricks

There are four things we do to produce a Zapp which are just "slightly nonobvious"... until you've discovered them.
All four are necessary in concert in order to produce the path-agnostic binaries that we call Zapps.

- 1. **"rpath"** -- we use an ELF header called rpath in order to specify library locations.
- 1.a. **"$ORIGIN"** -- there is a magic value needed in the rpath header which will cause the dynamic library loader to load libraries from paths relatively to the binary.
- 1.b. **"XORIGIN"** -- ... and you may need an additional trick to sneak these through some toolchains.
- 2. **bundle libraries** -- libraries need to be placed at a path relative to the binary.
- 3. **"ELF-interp as a lib"** -- we have to treat the ELF interpreter itself as if it was merely another library.
- 4. **"the jumploader"**: **"ldshim"** -- in order to accomplish the interp-as-a-lib step, we need a small static binary to reliably kickstart the process.

Let's look at these in detail.

---

### rpath

The end result needed is that the executable binary has an rpath header with an "`$ORIGIN`" prefix in it.

The end result can be detected by running `readelf -d thebinary` and looking at the output, which should contain something like this:

```
  Tag        Type                         Name/Value
    ...
 0x000000000000000f (RPATH)              Library rpath: [$ORIGIN/../lib]
    ...
```

#### rpath: getting there with C and make projects

Sometimes, you can just pass the flags relatively directly: e.g., `./configure -rpath=\$ORIGIN/../lib`.

However, sometimes this will fail you.  When?  When the project uses recursive `make`.

Funny story.  There's no correct way to pass a dollar-sign character through recursively invoked make.  The correct escaping sequence would be different depending on depth.  Yikes, right?

Not to worry: there's one little trick!  We'll pass the string "XORIGIN" instead!
Like this: `./configure -rpath=XORIGIN/../lib`.
Interestingly, this string isn't load-bearing until after the compilation process is complete.
It's also the _same length_ as the desired string... which means we can easily patch the position where it ends up in the binary, _without_ needing to calculate any complex relocations in the rest of the offsets in the binary.
And the "X" instead of "$" means there's no escaping hell while interacting with `make`.

And then we just run sed on the binary: `sed -i 's/XORIGIN/$ORIGIN/' thebinary`.

And that works.

(The first person to uncover this, to our knowledge, [documented it here](https://enchildfone.wordpress.com/2010/03/23/a-description-of-rpath-origin-ld_library_path-and-portable-linux-binaries/) -- and we're very grateful for their work.)

(A slightly better sed script is: `'0,/XORIGIN/{s/XORIGIN/$ORIGIN/}'`... as this only affects the first instance.)

If you don't like the XORIGIN trick: Another option is using a tool like `patchelf`.
Do what works for you!
(But we often like this more brutally simple XORIGIN hack, because it's more brutally simple.)

#### rpath: getting there with other toolchains

You can probably figure this out ;)  Nothing can be as crazy as the C-and-make story.  (We hope.)

---

### bundling libraries

This step is pretty simple.

If you looked at the examples above, you'll have seen that our recommended place to put binaries is "../lib", relative to the binary.

So, a filesystem like this:

```
./bin/
./bin/thebinary
./lib/
./lib/libfoo.so
./lib/libbar.s0
```

Pretty straightforward.

#### bundling libraries: actually doing it

The "correct" way to do this may vary based on your toolchain preferences.

One very hacky -- but terrifyingly effective way to do this -- is...
if you already have a working binary, run `ldd` on it.
Inspect `ldd`'s output, and copy the libraries from the paths it returns.
(Following this suggestion means you're bundling whatever libraries you have on your host,
and probably means that you don't really understand your supply chain -- _please don't do this_.
But it works.)

---

### the ELF interpreter is just a library

This requires a little background...

#### What's the ELF interpreter?

The ELF interpreter is a magical process that is part of how dynamically linked binaries are loaded on Linux.

**We're going to make it not-so-magical.**

The ELF interpreter is probably best understood by seeing it.
Take any (dynamically-linked) binary on your system, and run `strings` on it, and take the first line:

```
strings $(which bash) | head -n 1
```

What's it say?

On almost any Linux system, it's going to be exactly the same thing:

```
/lib64/ld-linux-x86-64.so.2
```

That's the path to the ELF interpreter.

The ELF interpreter is actually itself _an executable_.
When your process is being launched by the Linux kernel... the kernel knows what this very first header, this path to the ELF interpreter is.
The kernel _doesn't_ know what the rest of the ELF headers are all about.

So it invokes the ELF interpreter.  And it tells the ELF interpreter to invoke your program.

#### Why on earth do we care about all this?

The path to the ELF interpreter is an absolute path.  That won't do, will it?
We want _path-agnostic_ binaries.  So this has gotta go.

Can the path here be relative, like the `rpath` was, above?
Some other magic value like that?

Nope.

I don't know why.  This just isn't supported.
The kernel would have to know about it; and it doesn't.
And we consider "you have to patch the kernel" to be out-of-bounds for Zapps.

_Could_ we accept the ELF interpreter as a magic given?
It would feel a little dirty, but _could_ we?  Would it work?

Nope.

We tried that, actually.  And you're not gonna believe this.

The ELF interpreter on your system (probably, if it's an at all GNU-ish system)...
and the libc on your system (if it's glibc, which is a popular one)...
_they supply symbols to each other_.

_And they crash if those symbols don't match_.

That's right.  The (gnu) ELF interpreter and the (gnu) libc have a cyclic dependency at runtime.
(And bonus: when they crash?  They do it before your program even gets to its main method, because it's the ELF interpreter that's crashing out!  Whee!)

So.  This just underscores the importance of treating _everything_ as a library.
_Including_ the libc.  And, perhaps surprisingly, even the ELF interpreter itself.

(N.b., this bizarre fragility is not true of all "libc"s and all ELF interpreter implementations in the world --
and yes, there **is** more than one.
Nonetheless: this problem occurs with at least one of the popular ones, and so we have to deal with it!)

#### ELF interpreter as a library: actually doing it

This is pretty easy.  You just put the dang binary in the `lib/` folder, along with all the `*.so` files.

The trickier part is putting it to work.
As we mentioned above in the background sections...
there's no way to put a header in a binary which directs the kernel to look in a relative path for the ELF interpreter.
It _has_ to be an absolute path in that header.

So what do we do?

Time for key trick number 4...

---

### the jumploader

If you're reading this document linearly, you probably now -- with a sinking feeling of horror -- realize where this is going.  :)

We're going to need to ship a small static binary.

(Yes, we must.  The kernel itself has backed us into a corner at this point!  This is the only option that remains.)

Fortunately, this binary can be tiny indeed, because we just need it to do one thing:
it needs to launch the ELF interpreter (the one that we bundled!),
and tell _that_ to launch the real binary.
In other words, we just do what the kernel usually does with an ELF-format binary...
we just had to take command of the process very briefly, so we could say _which_ ELF interpreter to use.

#### the jumploader: actually doing it

We've built [a small shim program](https://github.com/warptools/ldshim) that you can use for this purpose.


We suggest that you build that shim program, statically,
and then arrange your filesystem like this:

```
./bin/
./bin/thebinary      # <- put the static shim here!
./dynbin/
./dynbin/thebinary   # <- put the original dynamic binary here!
./lib/
./lib/libfoo.so      # <- libraries still go over here.
```

This directory structure is what we recommend as the canonical pattern for Zapps.
The executables in the `./bin/` directory are the run-anywhere entry point;
the original executable in the `./dynbin/` directory is where the bulk of the content lives,
which keeps things overall simple.

---

That's it!  You should now have a working Zapp -- extremely portable, extremely self-contained, extremely ready-to-go.

---



Future Work
-----------

We by no means think the process of building Zapps is perfect -- yet.

- We hope to build more tools and automation for applying this process on any project source code!
	- Community effort on this would be extremely welcome!  Please get in touch!
- We have provided a link to a jumploader "ldshim" which works...
	- ... but it is the minimum viable product.
	- A smaller one could surely be fabricated!
- Yes, there are _several_ `exec` syscalls in the jumploader flow.
	- This is pretty acceptable in practice!
	- It's possible this could be improved optimistically in the future, if we taught the kernel to peek at our static jumploader binaries, see what they "mean" to do, and just do it with fewer execs.

Zapps _do work_ today, robustly, on every system we know of.
But there is always room for further improvement ;) and if you think you can make Zapps better --
either lighter-weight, easier to build, or even more portable (?! somehow?) -- we will welcome your contributions! :D
