### Usage

```coffee
LazyIterator = require 'lazy-iterator' # node only

li = new LazyIterator()

INTERVAL = 1000
i = 0

putInValue = ()->
	li.send(i)
	i += INTERVAL

setInterval putInValue, INTERVAL

do ->~
	for timePassed upon li
		console.log timePassed

# prints time passed in ms since start of loop
```

Equivalent JavaScript using task.js:

```js
var LazyIterator = require("lazy-iterator");	// node only
var li = new LazyIterator();

var INTERVAL = 1000, i = 0;
setInterval(function(){
    li.send(i);
    i += INTERVAL;
}, INTERVAL);

spawn(function*(){
    while(true){
        var out = yield li.next();
        if (out.done) break;
        else var timePassed = out.value;
        
        console.log(timePassed);
    }
});

```

### Version
0.0.1

### Installations
With npm: 
```sh
$ npm install lazy-stream
```

in browser include lazy-stream.js or lazy-stream.min.js in a script tag:

```html
    <script type="text/javascript" src="<path/to/either file>"></script>
```


License
----

MIT
