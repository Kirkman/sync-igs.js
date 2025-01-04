igs.js for Synchronet
=====================

What is this?
-------------

This is a quick-and-dirty upload of my library for working with the IGS, or "[Instant Graphics and Sound](https://breakintochat.com/wiki/Instant_Graphics_and_Sound_(IGS))," protocol on my Synchronet BBS.

This library provides methods for to do a bunch of things with IGS. 

For example, here's a code snippet that would create a text input field to let a user type in their password when logging into the BBS:

```
var password = igs.input({
	'x': 0,
	'y': 21,
	'w': 15,
	'h': 4,
	'boxc': 1,
	'fgc': 0,
	'bgc': 4,
	'label': 'Password',
	'max_tries': 5,
	'timeout': timeout,
	'obscured': true,
});
```

This code is probably very messy, and isn't _really_ intended for people to use. But I figured there might be some interest, and I wanted folks to be able to see how I'm doing some of the IGS-related things on my BBS.


Notes
-----

If you want to use the igs.js library in your own Synchronet BBS programming, then install the .js file in `/sbbs/mods/load/`.

Also, the `igs.js` library depends on another script I wrote, `helper-functions.js`, being installed in that same directory.


