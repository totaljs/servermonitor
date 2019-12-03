# Server Monitor

Total.js Server monitoring service. This service sends measured data (`Output object`) to the specific endpoint defined in the `/config` file.

__Measurable values__:

- custom app monitoring
- uptime
- CPU
- memory
- space on HDD (specific path only)
- count of connections on `80` port
- network upload/download traffic
- it obtains versions of specific apps

## How to use it?

- install Node.js platform
- perform `$ npm install`
- edit `/config` file by adding your custom settings
- run it

```bash
$ cd servermonitor
$ node index.js > servermonitor.log &
```

Then the script will send measured data to specific `endpoint`.

## Output object

```javascript
{
    memory: {
        total: 32772204,
        free: 29440636,
        used: 3331568
    },

    hdd: {
        total: 463427392,
        free: 383285600,
        used: 56577916
    },

    connections: 111,

    network: {
        download: 133791306.39,
        upload: 2525802603.93
    },

    uptime: 33483889,
    cpu: 0.12,

    apps: {
        nginx: {
            cpu: 0,
            memory: 312132,
            threads: 10
        },
        postgres: {
            cpu: 0,
            memory: 2315528,
            threads: 37
        },
        total: {
            cpu: 4.6,
            memory: 8289036,
            threads: 161
        }
    },

    versions: {
        nginx: '1.10.3',
        node: '10.15.3'
    },

    meta: {
        version: 1,
        os: 'linux'
    }
}
```

## Linux commands

- `ps`
- `uptime`
- `ifconfig`
- `netstat`
- `df`
- `free`
- `cat` with `/proc/stat`

## Contact

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: license.txt