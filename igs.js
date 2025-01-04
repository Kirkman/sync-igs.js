load('sbbsdefs.js');
load('helper-functions.js');


var IG_ASK_VER = 'G#?>0:';
var IG_VER_REG = /^\d\.\d\d/;

var IG_ASK_RES = 'G#?>3:';
var IG_RES_REG = /^(0|1|2|3):/;
var IG_RES_MAN_REG = /^(0|1|2|3)/;


var igs = {
	flowOff: function() {
		console.writeln('G#X>5,0:');
	},
	flowReset: function() {
		console.writeln('G#X>5,4:');
	},
	vsyncWait: function(t) {
		// normal vSync pause is in 1/60th's of a second. 
		// So if we want to wait 1.5 seconds, need a value of 90.
		t = t * 60;
		// Make sure this is in tenths. Math.random creates floats with too many decimals.
		t = Math.round(10*(t/10));

		console.writeln('G#q>'+t+':');
	},
	wait: function(t) {
		// Make sure this is in tenths. Math.random creates floats with too many decimals.
		t = Math.round(10*(t/10));

		console.writeln('G#t>'+t+':');
	},
	// Blits. Default to mode 3 (replace), but allow user to override
	scrnToScrn: function(x0, y0, x1, y1, dx, dy, mode) {
		mode = mode || 3;
		console.writeln('G#G>0,'+mode+','+x0+','+y0+','+x1+','+y1+','+dx+','+dy+':');
	},
	scrnToMem: function(x0, y0, x1, y1, mode) {
		mode = mode || 3;
		console.writeln('G#G>1,'+mode+','+x0+','+y0+','+x1+','+y1+':');
	},
	memToScrn: function(x0, y0, x1, y1, dx, dy, mode) {
		mode = mode || 3;
		console.writeln('G#G>3,'+mode+','+x0+','+y0+','+x1+','+y1+','+dx+','+dy+':');
	},
	// 1: Replace; 2: Transparent; 3: XOR; 4: Reverse transparent. 1 & 2 are best.
	drawMode: function(mode) {
		console.writeln('G#M>'+mode+':');
	},
	// Default: 1, 1, 0; Halftone: 2, 4, 0;
	setFill: function(pat_type, pat_idx, border_flag) {
		console.writeln('G#A>'+pat_type+','+pat_idx+','+border_flag+':');
	},
	drawRect: function(x, y, w, h, color, corners) {
		if (color == null) {
			color = 1;
		}
		if (corners == null) {
			corners = 0;
		}
		// Corners: 0=normal, 1=rounded
		var x2 = x+w;
		var y2 = y+h;
		console.writeln('G#C>2,'+color+':B>'+x+','+y+','+x2+','+y2+','+corners+':');
	},
	writeTextGrfx: function(x, y, str, color, size, attr, deg) {
		if (color == null) {
			color = 1;
		}
		if (size == null) {
			size = 8;
		}
		if (attr == null) {
			attr = 0;
		}
		if (deg == null) {
			deg = 0;
		}
		console.writeln('G#M>2:C>3,'+color+':E>'+attr+','+size+','+deg+':W>'+x+','+y+','+str+ '@');
		console.writeln('G#M>1:');
	},

	// Includes built-in word-wrap, constraining text to the specified width
	writeTextWrap: function(x, y, w, str, color, size, attr, deg) {
		// Dynamic Width (Build Regex)
		if (color == null) {
			color = 1;
		}
		if (size == null) {
			size = 8;
		}
		if (attr == null) {
			attr = 0;
		}
		if (deg == null) {
			deg = 0;
		}

		var pieces = str.split(/\s+/);
		var lines = [];
		var curr_line = '';

		for (var i=0; i<pieces.length; i++) {
			if ((curr_line.length + pieces[i].length) <= w) {
				curr_line = curr_line + ' ' + pieces[i];
				curr_line = curr_line.trim();
			}
			else {
				lines.push(curr_line);
				curr_line = '';
				curr_line = pieces[i];
			}
			if (i == pieces.length - 1) {
				lines.push(curr_line);
			}
		}

		// function wrap(s, w) {
		// 	return s.replace(new RegExp('(?![^\\n]{1,'+w+'$)([^\\n]{1,'+w+'})\\s', 'g'), '$1\n');
		// } 

		// var lines = wrap(str, w).split(/\n/);


		console.writeln('G#M>2:C>3,'+color+':E>'+attr+','+size+','+deg+':');

		for (var l=0; l<lines.length; l++) {
			var v_offset = y + ((size+1) * l);
			console.writeln('G#W>'+x+','+v_offset+','+lines[l]+ '@');
		}
		console.writeln('G#M>1:');
	},

	// x/y = row/col. Not error checking for out of bounds, so be careful
	writeTextVt52: function(x, y, str, color, bg) {
		if (color === null) {
			color = 1;
		}
		if (bg === null) {
			bg = 0;
		}
		var vtCol = vdiPenToVT(color);
		var vtBg = vdiPenToVT(bg);
		console.writeln('G#c>0,'+vtBg+':c>1,'+vtCol+':p>'+x+','+y+':');
		console.writeln(str);
	},
	putCursor: function(x, y) {
		console.writeln('G#p>'+x+','+y+':');
	},
	setTextVt52: function(color, bg) {
		if (color === null) {
			color = 1;
		}
		if (bg === null) {
			bg = 0;
		}
		var vtCol = vdiPenToVT(color);
		var vtBg = vdiPenToVT(bg);
		console.writeln('G#c>0,'+vtBg+':c>1,'+vtCol+':');
	},
	// 
	clearScreen: function(mode) {
		// Default to mode 4, which clears WHOLE screen with VDI and VT52 and sets cursor to home.
		mode = mode || 4;
		console.writeln('G#s>'+mode+':');
	},
	resetScreenVt52: function() {
		// Clear, Home, ReverseOff, Text Background to reg 0, text Color to register 3. All via VT52.
		igs.clearScreen(5);
	},
	playSound: function(n) {
		console.writeln('G#b>'+n+':');
		//  0  Alien Invasion
		//  1  Red Alert
		//  2  Gunshot
		//  3  Laser 1
		//  4  Jackhammer
		//  5  Teleport
		//  6  Explosion
		//  7  Laser 2
		//  8  Longbell
		//  9  Surprise
		// 10  Radio Broadcast
		// 11  Bounce Ball
		// 12  Eerie Sound
		// 13  Harley Motorcycle
		// 14  Helicopter
		// 15  Steam Locomotive
		// 16  Wave
		// 17  Robot Walk
		// 18  Passing Plane
		// 19  Landing
	},
	alterSound: function(play_flag, snd_num, elem_num, neg_flag, thousands, hundreds) {
		console.writeln('G#b>20,'+play_flag+','+snd_num+','+elem_num+','+neg_flag+','+thousands+','+hundreds+':');
	},
	restoreSound: function(n) {
		console.writeln('G#b>22,'+n+':');
	},
	stopSound: function() {
		console.writeln('G#b>21:');
	},

	playNote: function(snd_num, voice, vol, pitch, timing, stop) {
		console.writeln('G#n>'+snd_num+','+voice+','+vol+','+pitch+','+timing+','+stop+':');
	},
	// Automatically determine which version of IGS is being used by remote terminal.
	askVer: function() {

		// Send the IGS version request. An IGS terminal will respond with a string like "2.18"
		console.writeln(IG_ASK_VER);

		// Get bytes from the terminal until it stops "typing".
		var userInput = null;
		userInput = getBytesUntilPause(1000);

		if (!IG_VER_REG.test(userInput)) { return false; }

		return userInput;
	},
	// Manually ask the user which version of IGS they are using.
	manualVer: function() {
		var userInput = null;
		// Default to "no" and use deny(), since most ASCII callers will not have IGS.
		userInput = deny('Does your terminal support IGS?');
		// "true" in the context of deny(), means "no" was chosen.
		if (userInput === true) { return false; }

		userInput = prompt('What version of IGS are you using (2.17, 2.20, etc)?');

		if (!IG_VER_REG.test(userInput)) { 
			console.writeln('That was not a valid IGS version number. Proceeding without IGS support.');
			return false;
		}
		return userInput;

	},
	// Automatically determine the screen resolution of the remote terminal.
	askRes: function() {
		// Send the IGS resolution request. An IGS terminal will respond with a number from 0-2
		console.writeln(IG_ASK_RES);

		// Get bytes from the terminal until it stops "typing".
		var userInput = null;
		userInput = getBytesUntilPause(1000);

		if (!IG_RES_REG.test(userInput)) { return false; }

		return userInput;
	},
	// Manually ask the user which screen resolution they are using.
	manualRes: function() {
		var userInput = null;

		userInput = prompt('What is your screen resolution (0=Low, 1=Med, 2=High)?');

		// Test the user input.
		if (!IG_RES_MAN_REG.test(userInput)) {
			console.writeln('That was not a valid screen resolution. Proceeding without IGS support.');
			return false;
		}

		return userInput;
	},
	checkForIG: function() {
		var userInput = null;

		var USER_IG_VER = null;
		var USER_IG_RES = null;

		// Prompt the user so they know they can exit if they get here by mistake.
		console.writeln('If you are not using an Atari with IGS, hit any key to quit.');

		// Send the IGS version request. An IGS terminal will respond with a string like "2.18"
		userInput = this.askVer();

		// If we didn't get an IG version string (e.g. "2.18" or "2.19"), 
		// then ask the user directly. Some terminals, like FzDT, don't
		// respond to the askVer, so we'll ask the user directly.
		if (userInput === false) {
			console.writeln('Could not detect IGS version.');
			userInput = this.manualVer();
		}

		if (userInput === false) {
			return false;
		}

		USER_IG_VER = userInput;
		console.writeln('IGS version '+USER_IG_VER+' detected!');

		// Send the IGS resolution request. An IGS terminal will respond with a number from 0-2
		userInput = this.askRes();

		// If we didn't get an IGS resolution string (e.g. "0", "1", or "2"), then quit.
		if (userInput === false) {
			console.writeln('Could not detect your screen resolution.');
			userInput = this.manualRes();
		}

		if (userInput === false) {
			return false;
		}

		USER_IG_RES = userInput.replace(':','');
		console.writeln(resolutions[USER_IG_RES] + ' detected!');

		// Set custom properties on the bbs.mods object to keep track of user's settings.
		bbs.mods.user_ig_ver = USER_IG_VER;
		bbs.mods.user_ig_res = USER_IG_RES;

		return true;
	},
	msgBox: function(params) {
		var x = params.x;
		var y = params.y;
		var boxc = params.boxc;
		var fgc = params.fgc;
		var msg = params.msg;

		// In future might add logic to wrap the text if it's overflowing screen.
		var w = msg.length;
		var h = 3;

		var y2 = y+1;

		// Multiply row by 8 to get pixel position
		igs.drawRect(x*8, y*8, w*8, h*8, boxc, 1);
		igs.writeTextVt52(x+1, y2, msg, fgc, boxc);
	},
	input: function(params) {
		var x = params.x;
		var y = params.y;
		var w = params.w;
		var h = params.h;
		var boxc = params.boxc;
		var fgc = params.fgc;
		var bgc = params.bgc;
		var label = params.label;
		var max_tries = params.max_tries;
		var timeout = params.timeout;
		var obscured = params.obscured;
		var cursor = '|';

		var y2 = y+1;
		var y3 = y+2;

		var num_tries = 0
		var elapsed = 0;
		var start_time = new Date().getTime();

		while (num_tries < max_tries && elapsed < timeout) {
			// Multiply row by 8 to get pixel position
			igs.drawRect(x*8, y*8, w*8, h*8, boxc, 1);
			igs.writeTextVt52(x+1, y2, label, fgc, boxc);
			igs.drawRect((x+1)*8, y3*8, (w-2)*8, 8, bgc, 0);

			igs.setTextVt52(fgc, bgc);
			igs.putCursor(x+1, y3);
			igs.writeTextVt52(x+1, y3, '|', fgc, bgc);

			var userInput;

			// userInput = console.getstr();

			var input_complete = false;
			var change = false;
			var pos = 0;
			var text = '';
			while (!input_complete) {
				var key = console.inkey(K_NONE, 10000);

				// If we see 'ESC', then this is probably beginning of VT-52 esc sequence.
				// We need to fetch the next character and parse it.
				if (key == '\x1b') {
					var vt_cmd = console.inkey(K_NONE, 5000);
					switch(vt_cmd.toUpperCase()) {
						case 'A':
							key = KEY_UP;
							break;
						case 'B':
							key = KEY_DOWN;
							break;
						case 'C':
							key = KEY_RIGHT;
							break;
						case 'D':
							key = KEY_LEFT;
							break;
						case 'H':
							key = KEY_HOME;
							break;
					}
					// NO BREAK. We want to continue processing after parsing the VT-52 seq.
				}

				switch(key) {
					case '\x0c':    /* CTRL-L */
					case '\x00':    /* CTRL-@ (NULL) */
					case '\x03':    /* CTRL-C */
					case '\x04':    /* CTRL-D */
					case '\x0b':    /* CTRL-K */
					case '\x0e':    /* CTRL-N */
					case '\x0f':    /* CTRL-O */
					case '\x09':    // TAB
					case '\x10':    /* CTRL-P */
					case '\x11':    /* CTRL-Q */
					case '\x12':    /* CTRL-R */
					case '\x13':    /* CTRL-S */
					case '\x14':    /* CTRL-T */
					case '\x15':    /* CTRL-U */
					case '\x16':    /* CTRL-V */
					case '\x17':    /* CTRL-W */
					case '\x18':    /* CTRL-X */
					case '\x19':    /* CTRL-Y */
					case '\x1a':    /* CTRL-Z */
					case '\x1c':    /* CTRL-\ */
					case '\x1f':    /* CTRL-_ */

						text = false;
						input_complete = true;
						break;
					case KEY_UP:
					case KEY_HOME:
						pos = 0;
						break;
					case KEY_DOWN:
					case KEY_END:
						pos = text.length;
						break;
					case KEY_LEFT:
						pos = (pos === 0) ? 0 : pos - 1;
						break;
					case KEY_RIGHT:
						pos = (pos >= text.length) ? text.length : pos + 1;
						break;
					case '\b':
					case '\x08':
						if (pos === 0) break;
						text = text.split('');
						text.splice((pos - 1), 1);
						text = text.join('');
						pos--;
						change = true;
						break;
					case '\x7f':
						if (pos >= text.length) break;
						text = text.split('');
						text.splice((pos), 1);
						text = text.join('');
						change = true;
						break;
					case '\r':
					case '\n':
						userInput = text;
						text = '';
						pos = 0;
						change = true;
						// Clear the input
						igs.drawRect((x+1)*8, y3*8, (w-2)*8, 8, bgc, 0);
						input_complete = true;
						break;
					case '':
						change = false;
						break;
					default:
						key = strip_ctrl(key);
						if (pos !== text.length) {
							text = text.split('');
							text.splice(pos, 0, key);
							text = text.join('');
						} else {
							text += key;
						}
						pos++;
						change = true;
						break;

				} // end switch
				if (change) {
					// Clear the input
					igs.drawRect((x+1)*8, y3*8, (w-2)*8, 8, bgc, 0);

					if (obscured === true) {
						var asterisks = Array( text.length + 1 ).join('*');
						igs.writeTextVt52(x+1, y3, asterisks, fgc, bgc);
					}
					else {
						igs.writeTextVt52(x+1, y3, text, fgc, bgc);
					}

					igs.putCursor(x+1+pos, y3);
					igs.writeTextVt52(x+1+pos, y3, '|', fgc, bgc);

				}

			} // end input while


			var curr_time = new Date().getTime();
			elapsed = curr_time - start_time;

			if (userInput === undefined || userInput === false || userInput.length == 0) {
				num_tries += 1;
			}
			else {
				return userInput;
			}
		}
		return false;
	}

}

// Ask IGS resolution definitions
var resolutions = {
	'0': 'Low resolution',
	'1': 'Medium resolution',
	'2': 'High resolution',
	'3': 'Unknown resolution (Higher TT/Falcon?)'
};



// According to IGS, the VT-52 registers do NOT match the pen positions in VDI.
// So we'll stick to VDI, and just convert to VT-52 when needed.
function vdiPenToVT(pen) {
	const registers = [
		0,  // Pen 0  = Register 0
		15, // Pen 1  = Register 15
		1,  // Pen 2  = Register 1
		2,  // Pen 3  = Register 2
		4,  // Pen 4  = Register 4
		6,  // Pen 5  = Register 6
		3,  // Pen 6  = Register 3
		5,  // Pen 7  = Register 5
		7,  // Pen 8  = Register 7
		8,  // Pen 9  = Register 8
		9,  // Pen 10 = Register 9
		10, // Pen 11 = Register 10
		12, // Pen 12 = Register 12
		14, // Pen 13 = Register 14
		11, // Pen 14 = Register 11
		13, // Pen 15 = Register 13
	];
	return registers[pen];
}


function getBytesUntilPause(pause) {
	var userInput = '';
	var userByte = true;
	while (!js.terminated && userByte !== null) {
		userByte = console.getbyte(pause);
		if (userByte !== null) {
			userInput += ascii(userByte);
		}
	}
	return userInput;
}




