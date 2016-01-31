babel-register-cli
=========================

Just like babel-node, but using babel-register. So you could it in production.


## Why

- You should not be using `babel-node` in production. [https://babeljs.io/docs/usage/cli/](https://babeljs.io/docs/usage/cli/)
- `babel-register` is fussy. See below for detail.


### Before


```js
// index.js

require('babel-register');
require('./my-es6.js');

```

```shell

node index.js

```


### Now

```shell

babel-register my-es6.js

```


## Usage

```shell
babel-register --help

    Usage: babel-register <file> [options]

    Options:
      --debug        Debug port.
      -h, --help     Show help                                     [boolean]
      -v, --version  Show version number                           [boolean]

```



## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install babel-register-cli -g


## License

MIT
