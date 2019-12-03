// Version
CONF.version = 1;

// Dependencies
const Exec = require('child_process').exec;

// Regullar Expressions
const REG_EMPTY = /\s{2,}/g;
const REG_FINDVERSION = /[0-9.]+/;
const OS = require('os');

(function() {
	MAIN.os = OS.type().toLowerCase();

	if ((/darwin/).test(MAIN.os))
		MAIN.os = 'macos';
	else if ((/windows/).test(MAIN.os))
		MAIN.os = 'windows';

	MAIN.hostname = OS.hostname();
})();


NEWOPERATION('memory', function($) {
	Exec('free -b -t', function(err, response) {

		if (err) {
			$.invalid('memory', err);
			return;
		}

		var obj = {};
		var memory = response.split('\n')[1].match(/\d+/g);
		obj.total = (memory[0].parseInt() / 1024).floor(2);
		obj.free = ((memory[2].parseInt() + memory[4].parseInt()) / 1024).floor(2);
		obj.used = (memory[1].parseInt() / 1024).floor(2);
		$.callback(obj);
	});

}, 0, false);

NEWOPERATION('hdd', function($) {
	Exec('df -hTB1 {0}'.format(CONF.directory), function(err, response) {

		if (err) {
			$.invalid('hdd', err);
			return;
		}

		response.parseTerminal(function(info) {
			var obj = {};
			obj.total = (info[2].parseInt() / 1024).floor(2);
			obj.free = (info[4].parseInt() / 1024).floor(2);
			obj.used = (info[3].parseInt() / 1024).floor(2);
			$.callback(obj);
		}, 1);

	});
}, 0, false);

NEWOPERATION('connections', function($) {
	Exec('netstat -anp | grep :80 | grep TIME_WAIT| wc -l', function(err, response) {
		if (err)
			$.invalid('connections', err);
		else
			$.callback(response.trim().parseInt());
	});
}, 0, false);

NEWOPERATION('network', function($) {
	Exec('ifconfig eth0', function(err, response) {
		var match = response.match(/RX bytes:\d+|TX bytes:\d+/g);
		if (match) {
			var obj = {};
			obj.download = (match[0].parseInt2() / 1024).floor(2);
			obj.upload = (match[1].parseInt2() / 1024).floor(2);
			$.callback(obj);
		} else
			$.invalid('network', err);
	});
}, 0, false);

NEWOPERATION('uptime', function($) {
	Exec('uptime -s', function(err, response) {
		$.callback(response.replace(' ', 'T').parseDate().diff('seconds') * -1);
	});
}, 0, false);

NEWOPERATION('cpu', function($) {
	Exec('bash {0}'.format(PATH.root('/scripts/cpu.sh')), function(err, response) {
		if (err)
			$.invalid('cpu', err);
		else
			$.callback(response.trim().parseFloat().floor(2));
	});
}, 0, false);

NEWOPERATION('apps', function($) {
	var output = {};
	CONF.processes.wait(function(item, next) {

		var id;
		var name;

		if (item instanceof Array) {
			name = item[0];
			id = item[1];
		} else
			name = id = item;

		Exec('ps aux | grep "{0}" | grep -v "grep" | awk {\'print $2\'}'.format(id), function(err, response) {

			if (err) {
				next();
				return;
			}

			var obj = {};
			obj.cpu = 0;
			obj.memory = 0;
			obj.threads = 0;

			var pid = response.trim().split('\n').trim();
			obj.threads = pid.length;

			pid = pid.join(',');
			if (!pid) {
				next();
				return;
			}

			Exec('ps -p {0} -o %cpu,rss,etime'.format(pid), function(err, response) {

				response = response.split('\n');

				for (var i = 0; i < response.length; i++) {
					var line = response[i].trim();
					if (i && line && line.length >= 2) {
						line = line.replace(REG_EMPTY, ' ').split(' ');
						obj.cpu += line[0].parseFloat().floor(2);
						obj.memory += line[1].parseInt().floor(2);
					}
				}

				output[name] = obj;
				next();
			});
		});

	}, () => $.callback(output));

}, 0, false);

NEWOPERATION('versions', function($) {
	var output = {};
	CONF.versions.wait(function(item, next) {

		Exec(item[0] + ' ' + (item[1] || '--version'), function(err, response, response2) {

			if (err) {
				next();
				return;
			}

			var version = (response || response2).match(REG_FINDVERSION);
			output[item[0]] = version ? version.toString() : '';
			next();
		});

	}, () => $.callback(output));
}, 0, false);