require('total.js');

function measure() {
	RUN('memory, hdd, connections, network, uptime, cpu, apps, versions', function(err, response) {
		response.meta = { version: CONF.version, os: MAIN.os, hostname: MAIN.hostname, date: new Date() };
		RESTBuilder.POST(CONF.endpoint, response).callback(function(err) {
			err && console.log('ENDPOINT ERROR:', err);
			setTimeout(measure, CONF.interval);
		});
		setTimeout(measure, CONF.interval);
	});
}

console.log('====================================================');
console.log('PID           : ' + process.pid);
console.log('Node.js       : ' + process.version);
console.log('Date          : ' + NOW.format('yyyy-MM-dd HH:mm:ss'));
console.log('====================================================');

LOAD(true, null, measure);