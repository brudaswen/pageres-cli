import fs from 'fs';
import {spawn} from 'child_process';
import execa from 'execa';
import test from 'ava';
import {version as pkgVersion} from '../package';

process.chdir(__dirname);

test('generate screenshot', async t => {
	await execa('../cli.js', ['https://sindresorhus.com', '320x240']);

	t.true(fs.existsSync('sindresorhus.com-320x240.png'));
	fs.unlinkSync('sindresorhus.com-320x240.png');
});

test.cb('remove temporary files on cancel', t => {
	t.plan(1);

	const cp = spawn('../cli.js', ['https://sindresorhus.com', '320x240']);

	cp.on('exit', () => {
		t.false(fs.existsSync('sindresorhus.com-320x240.png'));
		t.end();
	});

	setTimeout(() => {
		cp.kill('SIGINT');
	}, 500);
});

test('show error if no url is specified', async t => {
	await t.throwsAsync(execa('../cli.js', ['320x240']), /Specify a url/);
});

test('use 1366x768 as default resolution', async t => {
	await execa('../cli.js', ['https://sindresorhus.com']);

	t.true(fs.existsSync('sindresorhus.com-1366x768.png'));
	fs.unlinkSync('sindresorhus.com-1366x768.png');
});

test('generate screenshots using keywords', async t => {
	await execa('../cli.js', ['https://sindresorhus.com', 'iphone5s']);

	t.true(fs.existsSync('sindresorhus.com-320x568.png'));
	fs.unlinkSync('sindresorhus.com-320x568.png');
});

test('show help screen', async t => {
	t.regex(await execa.stdout('../cli.js', ['--help']), /pageres <url>/);
});

test('show version', async t => {
	t.is(await execa.stdout('../cli.js', ['--version']), pkgVersion);
});
