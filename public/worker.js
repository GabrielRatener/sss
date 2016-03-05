(function () {
    'use strict';
    const _bzbSupportLib_0 = function () {
        'use strict';
        const symbols = {
            observer: Symbol('Observer symbol'),
            default: Symbol('Default symbol')
        };
        const returnVal = function (val) {
            return val;
        };
        const api = {
            symbols,
            async(fn) {
                return function () {
                    var gen = fn.apply(this, arguments);
                    try {
                        return resolved();
                    } catch (e) {
                        return Promise.reject(e);
                    }
                    function resolved(res) {
                        return next(gen.next(res));
                    }
                    function rejected(err) {
                        return next(gen.throw(err));
                    }
                    function next(ret) {
                        var val = ret.value;
                        if (ret.done) {
                            return Promise.resolve(val);
                        } else
                            try {
                                return val.then(resolved, rejected);
                            } catch (_) {
                                throw new Error('Expected Promise/A+');
                            }
                    }
                };
            },
            getObservableCtrl() {
                let first = true, promises = [];
                let onsend, onsendfail;
                let onnext, onnextfail;
                let done = function (value) {
                    onsend({
                        done: true,
                        value: value
                    });
                };
                let observable = {
                    [symbols.observer]() {
                        return observable;
                    },
                    next(value) {
                        if (first) {
                            if (value !== undefined)
                                throw new Error('First sent value must not exist!');
                            let p = new Promise(function (win, fail) {
                                onsend = win;
                                onsendfail = fail;
                            });
                            first = false;
                            api.code().then(done);
                            return p;
                        } else {
                            let p = new Promise(function (win, fail) {
                                onsend = win;
                                onsendfail = fail;
                            });
                            onnext(value);
                            return p;
                        }
                    }
                };
                let api = {
                    send(value) {
                        onsend({
                            value: value,
                            done: false
                        });
                        let npromise = new Promise(function (win, fail) {
                            onnext = win;
                            onnextfail = fail;
                        });
                        return npromise;
                    },
                    observable: observable
                };
                return api;
            },
            rest(iterable) {
                let array = [];
                for (let val of iterable) {
                    array.push(val);
                }
                return array;
            },
            restargs(args, index) {
                let arr = [];
                for (let i = index; i < args.length; i++) {
                    arr.push(args[i]);
                }
                return arr;
            },
            *iter(al) {
                for (var i = 0; i < al.length; i++) {
                    yield al[i];
                }
            },
            concat(args) {
                let argv = [];
                for (let i = 0; i < args.length; i++) {
                    for (let arg of args[i]) {
                        argv.push(arg);
                    }
                }
                return argv;
            },
            last() {
                if (arguments.length === 0)
                    return;
                return arguments[arguments.length - 1];
            },
            classify(cls, protoProps, staticProps) {
                var proto = cls.prototype;
                for (var key in protoProps) {
                    if (protoProps[key] instanceof Function) {
                        proto[key] = protoProps[key];
                    } else {
                        Object.defineProperty(proto, key, { get: returnVal.bind(null, protoProps[key]) });
                    }
                }
                for (var key in staticProps) {
                    cls[key] = staticProps[key];
                }
                return cls;
            },
            *keys(obj) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        yield key;
                    }
                }
            }
        };
        api[symbols.default] = api;
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = api;
        } else {
            let modules = null;
            const modcache = new Map();
            api.setModules = function (mdls) {
                modules = mdls;
            };
            api.require = function (n) {
                if (n === 0) {
                    return api;
                }
                if (modules.hasOwnProperty(n)) {
                    if (modcache.has(n)) {
                        return modcache.get(n);
                    } else {
                        const exports = {};
                        const modfn = modules[n];
                        modfn(exports);
                        modcache.set(n, exports);
                        return exports;
                    }
                } else {
                    throw new Error(`Cannot find module #${ n }!`);
                }
            };
            return api;
        }
    }.apply(this, []);
    _bzbSupportLib_0.setModules({
        '1': function (_exports_0) {
            function reflect() {
                return this;
            }
            function range(start, end, step) {
                step = step || 1;
                var i = start, ender = { done: true };
                if (step < 0)
                    return {
                        [Symbol.iterator]: reflect,
                        next() {
                            if (i > end) {
                                const status = {
                                    done: false,
                                    value: i
                                };
                                i += step;
                                return status;
                            } else
                                return ender;
                        }
                    };
                else
                    return {
                        [Symbol.iterator]: reflect,
                        next() {
                            if (i < end) {
                                const status = {
                                    done: false,
                                    value: i
                                };
                                i += step;
                                return status;
                            } else
                                return ender;
                        }
                    };
            }
            _exports_0.range = range;
            function* keys(object) {
                for (var key in object) {
                    yield key;
                }
            }
            _exports_0.keys = keys;
        },
        '2': function (_exports_0) {
            const _imports_0 = _bzbSupportLib_0.require(1), range = _imports_0.range, keys = _imports_0.keys;
            function reflect() {
                return this;
            }
            function enumerate(iterable) {
                var i = 0, iterator = iterable[Symbol.iterator]();
                return {
                    [Symbol.iterator]: reflect,
                    next() {
                        const ctrl = iterator.next();
                        if (ctrl.done) {
                            return ctrl;
                        } else {
                            return {
                                done: false,
                                value: [
                                    i++,
                                    ctrl.value
                                ]
                            };
                        }
                    }
                };
            }
            _exports_0.enumerate = enumerate;
            function cat(...iterables) {
                const length = iterables.length;
                const iterators = iterables.map(iterable => iterable[Symbol.iterator]());
                return {
                    [Symbol.iterator]: reflect,
                    next(val) {
                        const array = new Array(length);
                        for (var i = 0; i < length; i++) {
                            const ctrl = iterators[i].next(val);
                            if (ctrl.done) {
                                return { done: true };
                            } else {
                                array[i] = ctrl.done;
                            }
                        }
                        Object.freeze(array);
                        return {
                            done: false,
                            value: array
                        };
                    }
                };
            }
            _exports_0.cat = cat;
            function zip(...iterables) {
                const l = iterables.length;
                const iterators = iterables.map(iterable => iterable[Symbol.iterator]());
                return {
                    [Symbol.iterator]: reflect,
                    next() {
                        const values = new Array(l);
                        for (var i = 0; i < l; i++) {
                            const ctrl = iterators[i].next();
                            if (ctrl.done) {
                                return { done: true };
                            } else {
                                values[i] = ctrl.value;
                            }
                        }
                        Object.freeze(values);
                        return {
                            done: false,
                            value: values
                        };
                    }
                };
            }
            _exports_0.zip = zip;
            function keyvals(object) {
                const keygen = keys(object);
                return {
                    [Symbol.iterator]: reflect,
                    next() {
                        const ctrl = keygen.next();
                        if (ctrl.done) {
                            return ctrl;
                        } else {
                            return {
                                done: false,
                                value: [
                                    ctrl.value,
                                    object[ctrl.value]
                                ]
                            };
                        }
                    }
                };
            }
            _exports_0.keyvals = keyvals;
            _exports_0.range = range;
            _exports_0.keys = keys;
            class Iterable {
                [Symbol.iterator]() {
                    return this.iterate();
                }
                iterate() {
                    throw new Error('\'iterator\' method must be implemented!');
                }
            }
            _exports_0[_bzbSupportLib_0.symbols.default] = Iterable;
        },
        '3': function (_exports_0) {
            function node(value) {
                return {
                    value: value,
                    next: undefined,
                    prev: undefined
                };
            }
            function Queue() {
                var head, ass, length = 0;
                this.enqueue = function (value) {
                    var nd = node(value);
                    if (length === 0) {
                        head = ass = nd;
                    } else {
                        nd.next = ass;
                        ass.prev = nd;
                        ass = nd;
                    }
                    length += 1;
                };
                this.dequeue = function () {
                    if (length === 0) {
                        throw new Error('Cannot pop');
                    } else {
                        var rval = head.value;
                        if (length === 1) {
                            head = ass = undefined;
                        } else {
                            head.prev.next = undefined;
                            head = head.prev;
                        }
                        length -= 1;
                        return rval;
                    }
                };
                this.isEmpty = function () {
                    return length === 0;
                };
                Object.defineProperty(this, 'length', {
                    get: function () {
                        return length;
                    },
                    set: function (value) {
                        throw new Error('Readonly property');
                    }
                });
            }
            _exports_0.Queue = Queue;
        },
        '4': function (_exports_0) {
            const blib = _bzbSupportLib_0.require(0)[_bzbSupportLib_0.symbols.default];
            const Queue = _bzbSupportLib_0.require(3).Queue;
            class Observable {
                [blib.symbols.observer]() {
                    return this.observe();
                }
                observe() {
                    throw new Error('\'observe\' method must be implemented!');
                }
            }
            _exports_0[_bzbSupportLib_0.symbols.default] = Observable;
            function Observer(func) {
                var fulfillers = new Queue(), values = new Queue(), done = false, endvalue = undefined, error = false;
                function update() {
                    while (!fulfillers.isEmpty() && !values.isEmpty()) {
                        const ctrl = fulfillers.dequeue(), value = values.dequeue();
                        ctrl.win({
                            done: false,
                            value: value
                        });
                    }
                    if (done) {
                        if (error) {
                            while (!fulfillers.isEmpty()) {
                                const ctrl = fulfillers.dequeue();
                                ctrl.fail(endvalue);
                            }
                        } else {
                            const abso = {
                                value: endvalue,
                                done: true
                            };
                            Object.freeze(abso);
                            while (!fulfillers.isEmpty()) {
                                const ctrl = fulfillers.dequeue();
                                ctrl.win(abso);
                            }
                        }
                    }
                }
                function send(value) {
                    if (done)
                        throw new Error('Observer is closed, cannot send to it!');
                    values.enqueue(value);
                    update();
                }
                function close(value) {
                    if (done)
                        throw new Error('Observer is closed, cannot re-close it!');
                    done = true;
                    endvalue = value;
                    update();
                }
                function raise(value) {
                    if (done)
                        throw new Error('Observer is closed, cannot raise error on it!');
                    error = true;
                    close(value);
                }
                this.next = function () {
                    return new Promise((win, fail) => {
                        fulfillers.enqueue({
                            win,
                            fail
                        });
                        update();
                    });
                };
                this[blib.symbols.observer] = function () {
                    return this;
                };
                func(send, close, raise);
            }
            _exports_0.Observer = Observer;
            class EventObservable extends Observable {
                constructor(func) {
                    super();
                    var resolve, reject, done = false;
                    const fire = e => {
                        if (done) {
                            throw new Error('EventObservable has died!');
                        }
                        for (var listener of this._listeners) {
                            const listen = listener[1];
                            listen(e);
                        }
                    };
                    const finish = val => {
                        done = true;
                        this._listeners.clear();
                        resolve(val);
                    };
                    this._id = 0;
                    this._listeners = new Map();
                    this._done = new Promise((win, fail) => {
                        resolve = win;
                        reject = fail;
                    });
                    func(fire, finish, reject);
                }
                addListener(func) {
                    const id = this._id++;
                    this._listeners.set(id, func);
                    return id;
                }
                removeListener(id) {
                    this._listeners.delete(id);
                }
                observe() {
                    return new Observer((send, end, fail) => {
                        const id = this.addListener(send);
                        this._done.then(end, fail);
                    });
                }
                then(onFulfilled, onRejected) {
                    return this._done.then(onFulfilled, onRejected);
                }
                map(fn, endfn) {
                    const builder = this.constructor;
                    endfn = endfn || (e => e);
                    return new builder((send, close, error) => {
                        const id = this.addListener(e => {
                            send(fn(e));
                        });
                        this._done.then(val => {
                            this.removeListener(id);
                            send(endfn(val));
                        }, err => {
                            error(err);
                        });
                    });
                }
                reduce(fn, initial, endfn) {
                    endfn = endfn || (e => e);
                    return new Promise((win, fail) => {
                        var accumlation = initial;
                        this.addListener(e => {
                            accumlation = fn(accumlation, e);
                        });
                        this._done.then(val => {
                            win(endfn(accumlation, val));
                        }, fail);
                    });
                }
            }
            _exports_0.EventObservable = EventObservable;
        },
        '5': function (_exports_0) {
            const node = function (value) {
                    return {
                        value: value,
                        next: undefined,
                        prev: undefined
                    };
                }, Queue = function () {
                    let head, ass, length = 0;
                    this.add = function (value) {
                        let _opvar_0;
                        let nd = node(value);
                        if (length === 0) {
                            head = ass = nd;
                        } else {
                            nd.next = ass;
                            ass.prev = nd;
                            ass = nd;
                        }
                        length += 1;
                    };
                    this.pop = function () {
                        let _opvar_1;
                        if (length === 0) {
                            throw new Error('Cannot pop');
                        } else {
                            let _opvar_2;
                            let rval = head.value;
                            if (length === 1) {
                                head = ass = undefined;
                            } else {
                                head.prev.next = undefined;
                                head = head.prev;
                            }
                            length -= 1;
                            return rval;
                        }
                    };
                    this.isEmpty = function () {
                        let _opvar_3;
                        return length === 0;
                    };
                    Object.defineProperty(this, 'length', {
                        get: function () {
                            return length;
                        },
                        set: function (value) {
                            throw new Error('Readonly property');
                        }
                    });
                }, Stream = function () {
                    const update = function () {
                        while (!(fulfillers.isEmpty() || values.isEmpty())) {
                            let ctrl = fulfillers.pop(), value = values.pop();
                            ctrl.win({
                                done: false,
                                value: value
                            });
                        }
                        if (done) {
                            while (!fulfillers.isEmpty()) {
                                let ctrl = fulfillers.pop();
                                ctrl.win({
                                    done: true,
                                    value: undefined
                                });
                            }
                        }
                    };
                    let fulfillers = new Queue(), values = new Queue(), done = false;
                    this.close = function () {
                        done = true;
                        update();
                    };
                    this.send = function (value) {
                        if (done) {
                            throw new Error('Lazy iterator is closed, cannot send to it!');
                        }
                        values.add(value);
                        update();
                    };
                    this.next = function () {
                        return new Promise(function (win, fail) {
                            fulfillers.add({
                                win,
                                fail
                            });
                            update();
                        });
                    };
                    this.nextValue = function () {
                        let prom = this.next();
                        return prom.then(function (wf) {
                            return wf.value;
                        });
                    };
                    this[symbols.observer] = function () {
                        return this;
                    };
                    Object.defineProperty(this, 'closed', {
                        get: function () {
                            return done;
                        },
                        set: function (value) {
                            throw new Error('Readonly property');
                        }
                    });
                };
            const symbols = _bzbSupportLib_0.require(0).symbols;
            _exports_0.Stream = Stream;
        },
        '6': function (_exports_0) {
            const idgen = function () {
                    let i = 0;
                    return function () {
                        const _returnValue_0 = i;
                        i += 1;
                        return _returnValue_0;
                    };
                }, printMap = function (map) {
                    const obj = {};
                    console.log('map {');
                    for (let _iterant_0 of map) {
                        const _iterator_0 = _iterant_0[Symbol.iterator](), key = _iterator_0.next().value, value = _iterator_0.next().value;
                        console.log('\\t', key, value);
                    }
                    console.log('}');
                }, bind = function (id, type, action) {
                    document.getElementById(id).addEventListener(type, action);
                    return action;
                }, keys = function (obj) {
                    return blib.keys(obj);
                }, printSet = function (setr) {
                    const arr = [];
                    for (let _iterant_1 of setr) {
                        const el = _iterant_1;
                        arr.push(el);
                    }
                    console.log('{', arr, '}');
                }, enumerate = function (iterable) {
                    let i = 0, gen = iterable[Symbol.iterator](), api = {
                            next: function () {
                                const mynext = gen.next();
                                if (mynext.done) {
                                    return {
                                        done: true,
                                        value: undefined
                                    };
                                } else {
                                    const _returnValue_1 = {
                                        done: false,
                                        value: [
                                            i,
                                            mynext.value
                                        ]
                                    };
                                    i += 1;
                                    return _returnValue_1;
                                }
                            }
                        };
                    api[Symbol.iterator] = function () {
                        return api;
                    };
                    return api;
                }, tube = function () {
                    return new Stream();
                }, range = function* (start, end, step) {
                    step = step === undefined ? 1 : step;
                    let _opvar_4;
                    while (start !== end) {
                        yield start;
                        start += step;
                    }
                }, tuple = function () {
                    const args = _bzbSupportLib_0.restargs(arguments, 0);
                    Object.freeze(args);
                    return args;
                }, zip = function* () {
                    const args = _bzbSupportLib_0.restargs(arguments, 0);
                    const len = args.length;
                    const gens = new Array(args.length);
                    for (let _iterant_2 of range(0, args.length)) {
                        const i = _iterant_2;
                        gens[i] = args[i][Symbol.iterator]();
                    }
                    while (true) {
                        let _opvar_5;
                        const vals = new Array(len);
                        let i = 0;
                        while (i < len) {
                            const ctrl = gens[i].next();
                            if (ctrl.done) {
                                return;
                            } else {
                                vals[i] = ctrl.value;
                            }
                            i += 1;
                        }
                        Object.freeze(vals);
                        yield vals;
                    }
                }, cat = function* () {
                    const args = _bzbSupportLib_0.restargs(arguments, 0);
                    for (let _iterant_3 of args) {
                        const iter = _iterant_3;
                        yield* iter[Symbol.iterator]();
                    }
                }, sleep = function (ms) {
                    return new Promise(function (win, fail) {
                        setTimeout(win, ms);
                    });
                }, Array2D = function (h, w) {
                    const table = new Map();
                    this.get = function (_patternPlaceholder_0) {
                        const _iterator_1 = _patternPlaceholder_0[Symbol.iterator](), x = _iterator_1.next().value, y = _iterator_1.next().value;
                        let code = width * y + x;
                        if (table.has(code)) {
                            return table.get(width * y + x);
                        } else {
                            return undefined;
                        }
                    };
                    this.set = function (_patternPlaceholder_1, value) {
                        const _iterator_2 = _patternPlaceholder_1[Symbol.iterator](), x = _iterator_2.next().value, y = _iterator_2.next().value;
                        table.set(width * y + x, value);
                    };
                    this.delete = function (_patternPlaceholder_2) {
                        const _iterator_3 = _patternPlaceholder_2[Symbol.iterator](), x = _iterator_3.next().value, y = _iterator_3.next().value;
                        table.delete(width * y + x);
                    };
                }, combinations = function* (arr, n, offset, last) {
                    offset = offset === undefined ? 0 : offset;
                    last = last === undefined ? [] : last;
                    let _opvar_6;
                    if (n === 0) {
                        yield last;
                        return;
                    }
                    for (let _iterant_4 of range(offset, arr.length - n + 1)) {
                        const i = _iterant_4;
                        const sofar = last.concat(arr[i]);
                        yield* combinations(arr, n - 1, i + 1, sofar);
                    }
                }, run = function (fn) {
                    return fn();
                };
            const Stream = _bzbSupportLib_0.require(5).Stream;
            const blib = _bzbSupportLib_0.require(0)[_bzbSupportLib_0.symbols.default];
            _exports_0.idgen = idgen;
            _exports_0.printMap = printMap;
            _exports_0.bind = bind;
            _exports_0.keys = keys;
            _exports_0.printSet = printSet;
            _exports_0.enumerate = enumerate;
            _exports_0.tube = tube;
            _exports_0.range = range;
            _exports_0.tuple = tuple;
            _exports_0.zip = zip;
            _exports_0.cat = cat;
            _exports_0.sleep = sleep;
            _exports_0.Array2D = Array2D;
            _exports_0.combinations = combinations;
            _exports_0.run = run;
            const Iterable = run(function () {
                const Iterable = function () {
                    'do nothing';
                };
                Iterable.prototype[Symbol.iterator] = function () {
                    return this.iterate();
                };
                Iterable.prototype['iterate'] = function () {
                    throw new Error('"iterate" not implemented!');
                };
                return Iterable;
            });
            _exports_0.Iterable = Iterable;
            const Observable = run(function () {
                const Observable = function () {
                    'do nothing';
                };
                Observable.prototype[blib.symbols.observer] = function () {
                    return this.observe();
                };
                Observable.prototype['observe'] = function () {
                    throw new Error('"observe" not implemented!');
                };
                return Observable;
            });
            _exports_0.Observable = Observable;
        },
        '7': function (_exports_0) {
            const initialSet = function (n) {
                    const set = new Set();
                    for (let _iterant_5 of range(0, n)) {
                        const i = _iterant_5;
                        set.add(i + 1);
                    }
                    return set;
                }, toJSON = function (sudoku) {
                    return sudoku.toJSON();
                }, fromJSON = function (json) {
                    const sudoku = new Sudoku(json.size);
                    for (let _iterant_6 of keyvals(json.mappings)) {
                        const _iterator_4 = _iterant_6[Symbol.iterator](), position = _iterator_4.next().value, value = _iterator_4.next().value;
                        const pt = sudoku.decode(+position);
                        sudoku.set(pt, +value);
                    }
                    return sudoku;
                };
            const _imports_1 = _bzbSupportLib_0.require(2), range = _imports_1.range, zip = _imports_1.zip, keyvals = _imports_1.keyvals;
            const EventObservable = _bzbSupportLib_0.require(4).EventObservable;
            const _imports_2 = _bzbSupportLib_0.require(6), tuple = _imports_2.tuple, printSet = _imports_2.printSet;
            const _patternPlaceholder_3 = Math, sqrt = _patternPlaceholder_3.sqrt, round = _patternPlaceholder_3.round, floor = _patternPlaceholder_3.floor, random = _patternPlaceholder_3.random;
            _exports_0.toJSON = toJSON;
            _exports_0.fromJSON = fromJSON;
            const Sudoku = class {
                constructor(n, options, copymode) {
                    n = n === undefined ? 9 : n;
                    options = options === undefined ? {} : options;
                    copymode = copymode === undefined ? false : copymode;
                    this._boxSize = round(sqrt(n));
                    this._size = n;
                    this._area = Math.pow(n, 2);
                    this._grid = new Array(this._size);
                    this._count = 0;
                    this.changes = new EventObservable(function (fire, close) {
                        this._fire = fire;
                        this._close = close;
                    }.bind(this));
                    for (let _iterant_7 of range(0, this._size)) {
                        const i = _iterant_7;
                        if (copymode) {
                            this._grid[i] = new Array(this._size);
                            continue;
                        }
                        const arr = new Array(this._size);
                        for (let _iterant_8 of range(0, arr.length)) {
                            const j = _iterant_8;
                            arr[j] = initialSet(this._size);
                        }
                        this._grid[i] = arr;
                    }
                }
                copy() {
                    const copied = new Sudoku(this._size, {}, true);
                    copied._count = this._count;
                    for (let _iterant_9 of range(0, this._size)) {
                        const x = _iterant_9;
                        for (let _iterant_10 of range(0, this._size)) {
                            const y = _iterant_10;
                            if (this._grid[y][x] instanceof Set) {
                                copied._grid[y][x] = new Set(this._grid[y][x]);
                            } else {
                                copied._grid[y][x] = this._grid[y][x];
                            }
                        }
                    }
                    return copied;
                }
                get(_patternPlaceholder_4) {
                    const _iterator_5 = _patternPlaceholder_4[Symbol.iterator](), x = _iterator_5.next().value, y = _iterator_5.next().value;
                    const value = this._grid[y][x];
                    if (value instanceof Set) {
                        return 0;
                    } else {
                        return value;
                    }
                }
                set(_patternPlaceholder_5, value, quiet, update) {
                    const _iterator_7 = _patternPlaceholder_5[Symbol.iterator](), x = _iterator_7.next().value, y = _iterator_7.next().value;
                    quiet = quiet === undefined ? false : quiet;
                    update = update === undefined ? true : update;
                    if (this._grid[y][x] instanceof Set) {
                        let _opvar_9;
                        this._count += 1;
                        this._grid[y][x] = +value;
                        for (let _iterant_11 of this.collectionsAt([
                                x,
                                y
                            ])) {
                            const collection = _iterant_11;
                            for (let _iterant_12 of collection.iterate()) {
                                const _iterator_6 = _iterant_12[Symbol.iterator](), i = _iterator_6.next().value, j = _iterator_6.next().value;
                                let _opvar_7, _opvar_8;
                                if (i === x && j === y) {
                                    continue;
                                }
                                if (this.determined([
                                        i,
                                        j
                                    ])) {
                                    continue;
                                }
                                this.removePossibility([
                                    i,
                                    j
                                ], value);
                            }
                        }
                        if (!quiet) {
                            this._fire({
                                point: [
                                    x,
                                    y
                                ],
                                value: +value
                            });
                        }
                        if (this._count === this._area) {
                            this._close();
                        }
                    } else {
                        throw new Error('Tile [' + x + ', ' + y + '] has already been assigned');
                    }
                }
                determined(_patternPlaceholder_6) {
                    const _iterator_8 = _patternPlaceholder_6[Symbol.iterator](), x = _iterator_8.next().value, y = _iterator_8.next().value;
                    return !(this._grid[y][x] instanceof Set);
                }
                isPossible(_patternPlaceholder_7, value) {
                    const _iterator_9 = _patternPlaceholder_7[Symbol.iterator](), x = _iterator_9.next().value, y = _iterator_9.next().value;
                    const val = this._grid[y][x];
                    if (val instanceof Set) {
                        return val.has(value);
                    } else {
                        let _opvar_10;
                        return val === value;
                    }
                }
                getPossibilities(_patternPlaceholder_8, value) {
                    const _iterator_10 = _patternPlaceholder_8[Symbol.iterator](), x = _iterator_10.next().value, y = _iterator_10.next().value;
                    const val = this._grid[y][x];
                    if (val instanceof Set) {
                        return new Set(val);
                    } else {
                        return new Set([val]);
                    }
                }
                removePossibility(_patternPlaceholder_9, value) {
                    const _iterator_11 = _patternPlaceholder_9[Symbol.iterator](), x = _iterator_11.next().value, y = _iterator_11.next().value;
                    const val = this._grid[y][x];
                    if (val instanceof Set) {
                        if (val.has(value)) {
                            val.delete(value);
                        }
                    }
                }
                update() {
                    for (let _iterant_13 of this.emptyPoints()) {
                        const _iterator_12 = _iterant_13[Symbol.iterator](), x = _iterator_12.next().value, y = _iterator_12.next().value;
                        let _opvar_11;
                        const set = this._grid[y][x];
                        if (!(set.size === 1)) {
                            continue;
                        }
                        for (let _iterant_14 of set) {
                            const val = _iterant_14;
                            this.set([
                                x,
                                y
                            ], val);
                        }
                    }
                }
                *collectionsAt(pt) {
                    yield this.boxAt(pt);
                    yield this.rowAt(pt);
                    yield this.columnAt(pt);
                }
                boxAt(_patternPlaceholder_10) {
                    const _iterator_13 = _patternPlaceholder_10[Symbol.iterator](), x = _iterator_13.next().value, y = _iterator_13.next().value;
                    const left = 3 * Math.floor(x / 3), top = 3 * Math.floor(y / 3);
                    return new Box(this._boxSize, tuple(left, top));
                }
                rowAt(_patternPlaceholder_11) {
                    const _iterator_14 = _patternPlaceholder_11[Symbol.iterator](), x = _iterator_14.next().value, y = _iterator_14.next().value;
                    return new Row(this._size, [
                        0,
                        y
                    ]);
                }
                columnAt(_patternPlaceholder_12) {
                    const _iterator_15 = _patternPlaceholder_12[Symbol.iterator](), x = _iterator_15.next().value, y = _iterator_15.next().value;
                    return new Column(this._size, [
                        x,
                        0
                    ]);
                }
                *boxes() {
                    const boxSize = round(sqrt(this._size));
                    for (let _iterant_15 of range(0, boxSize)) {
                        const x = _iterant_15;
                        for (let _iterant_16 of range(0, boxSize)) {
                            const y = _iterant_16;
                            yield new Box(this._boxSize, tuple(boxSize * x, boxSize * y));
                        }
                    }
                    return;
                }
                *allCollections() {
                    for (let _iterant_17 of zip(range(0, this._size), this.boxes())) {
                        const _iterator_16 = _iterant_17[Symbol.iterator](), i = _iterator_16.next().value, box = _iterator_16.next().value;
                        yield this.rowAt([
                            i,
                            i
                        ]);
                        yield this.columnAt([
                            i,
                            i
                        ]);
                        yield box;
                    }
                }
                size() {
                    return this._size;
                }
                completed() {
                    let _opvar_12;
                    return this._area === this._count;
                }
                encode(_patternPlaceholder_13) {
                    const _iterator_17 = _patternPlaceholder_13[Symbol.iterator](), x = _iterator_17.next().value, y = _iterator_17.next().value;
                    return this._size * y + x;
                }
                decode(n) {
                    return tuple(n % this._size, Math.floor(n / this._size));
                }
                randomEmptyPoint() {
                    if (this.completed()) {
                        throw new Error('No empty points!');
                    }
                    while (true) {
                        const pt = this.randomPoint();
                        if (this.determined(pt)) {
                            continue;
                        }
                        return pt;
                    }
                }
                randomPoint() {
                    const x = floor(9 * random()), y = floor(9 * random());
                    return tuple(x, y);
                }
                toJSON() {
                    const mappings = {};
                    for (let _iterant_18 of range(0, this._size)) {
                        const x = _iterant_18;
                        for (let _iterant_19 of range(0, this._size)) {
                            const y = _iterant_19;
                            const val = this._grid[y][x];
                            if (val instanceof Set) {
                                continue;
                            }
                            mappings[this.encode([
                                x,
                                y
                            ])] = val;
                        }
                    }
                    return {
                        mappings,
                        size: this._size
                    };
                }
                toString() {
                    const buff = new Array(this._area);
                    for (let _iterant_20 of range(0, this._size)) {
                        const y = _iterant_20;
                        for (let _iterant_21 of range(0, this._size)) {
                            const x = _iterant_21;
                            const pt = [
                                x,
                                y
                            ];
                            buff[this.encode(pt)] = this.get(pt);
                        }
                    }
                    return buff.join('');
                }
                *emptyPoints() {
                    for (let _iterant_22 of range(0, this._size)) {
                        const x = _iterant_22;
                        for (let _iterant_23 of range(0, this._size)) {
                            const y = _iterant_23;
                            if (!(this._grid[y][x] instanceof Set)) {
                                continue;
                            }
                            yield tuple(x, y);
                        }
                    }
                }
                range(_patternPlaceholder_14) {
                    const _iterator_18 = _patternPlaceholder_14[Symbol.iterator](), x = _iterator_18.next().value, y = _iterator_18.next().value;
                    if (this.determined([
                            x,
                            y
                        ])) {
                        return 1;
                    } else {
                        return this._grid[y][x].size;
                    }
                }
                validate() {
                    const colmap = new Map(), rowmap = new Map(), boxmap = new Map();
                    for (let _iterant_24 of range(0, this._size)) {
                        const x = _iterant_24;
                        for (let _iterant_25 of range(0, this._size)) {
                            const y = _iterant_25;
                            let _opvar_13;
                            const value = this.get([
                                x,
                                y
                            ]);
                            if (value === 0) {
                                let _opvar_14;
                                const possible = this.getPossibilities([
                                    x,
                                    y
                                ]);
                                if (possible.size === 0) {
                                    return false;
                                }
                            } else {
                                const pairs = [
                                    tuple(colmap, x),
                                    tuple(rowmap, y),
                                    tuple(boxmap, '' + Math.floor(y / 3) + '' + Math.floor(x / 3) + '')
                                ];
                                for (let _iterant_26 of pairs) {
                                    const _iterator_19 = _iterant_26[Symbol.iterator](), house = _iterator_19.next().value, hash = _iterator_19.next().value;
                                    if (!house.has(hash)) {
                                        house.set(hash, new Set());
                                    }
                                    const set = house.get(hash);
                                    if (set.has(value)) {
                                        return false;
                                    } else {
                                        set.add(value);
                                    }
                                }
                            }
                        }
                    }
                    return true;
                }
            };
            _exports_0.Sudoku = Sudoku;
            const Collection = class {
                constructor(size, point) {
                    this._size = size;
                    this._point = point;
                }
                *iterate() {
                    throw new Error('Must be subclassed!');
                }
            };
            const Box = _bzbSupportLib_0.classify(class extends Collection {
                *iterate() {
                    let _patternPlaceholder_15 = this._point, _iterator_20 = _patternPlaceholder_15[Symbol.iterator](), x0 = _iterator_20.next().value, y0 = _iterator_20.next().value;
                    for (let _iterant_27 of range(0, this._size)) {
                        const x = _iterant_27;
                        for (let _iterant_28 of range(0, this._size)) {
                            const y = _iterant_28;
                            yield tuple(x0 + x, y0 + y);
                        }
                    }
                    return;
                }
            }, { type: 'box' });
            _exports_0.Box = Box;
            const Column = _bzbSupportLib_0.classify(class extends Collection {
                *iterate() {
                    let _patternPlaceholder_16 = this._point, _iterator_21 = _patternPlaceholder_16[Symbol.iterator](), x0 = _iterator_21.next().value, y0 = _iterator_21.next().value;
                    for (let _iterant_29 of range(0, this._size)) {
                        const y = _iterant_29;
                        yield tuple(x0, y);
                    }
                }
            }, { type: 'column' });
            _exports_0.Column = Column;
            const Row = _bzbSupportLib_0.classify(class extends Collection {
                *iterate() {
                    let _patternPlaceholder_17 = this._point, _iterator_22 = _patternPlaceholder_17[Symbol.iterator](), x0 = _iterator_22.next().value, y0 = _iterator_22.next().value;
                    for (let _iterant_30 of range(0, this._size)) {
                        const x = _iterant_30;
                        yield tuple(x, y0);
                    }
                }
            }, { type: 'row' });
            _exports_0.Row = Row;
        },
        '8': function (_exports_0) {
            const hiddenSets = function (sudoku, n, collection) {
                collection = collection === undefined ? null : collection;
                let _opvar_15;
                if (collection === null) {
                    for (let _iterant_31 of sudoku.allCollections()) {
                        const group = _iterant_31;
                        hiddenSets(sudoku, n, group);
                    }
                } else {
                    let _opvar_16;
                    const tried = new Set(), val2points = new Map(), vals = [];
                    for (let _iterant_32 of collection.iterate()) {
                        const pt = _iterant_32;
                        const ptcode = sudoku.encode(pt);
                        if (sudoku.determined(pt)) {
                            continue;
                        }
                        for (let _iterant_33 of sudoku.getPossibilities(pt)) {
                            const val = _iterant_33;
                            if (!val2points.has(val)) {
                                vals.push(val);
                                val2points.set(val, new Set());
                            }
                            val2points.get(val).add(ptcode);
                        }
                    }
                    if (!(vals.length > n)) {
                        return;
                    }
                    for (let _iterant_34 of combinations(vals, n)) {
                        const combo = _iterant_34;
                        let _opvar_17;
                        const points = new Set();
                        for (let _iterant_35 of combo) {
                            const val = _iterant_35;
                            for (let _iterant_36 of val2points.get(val)) {
                                const ptcode = _iterant_36;
                                points.add(ptcode);
                            }
                        }
                        if (points.size === n) {
                            const comboSet = new Set(combo);
                            for (let _iterant_37 of points) {
                                const ptcode = _iterant_37;
                                const pt = sudoku.decode(ptcode);
                                if (sudoku.determined(pt)) {
                                    continue;
                                }
                                for (let _iterant_38 of sudoku.getPossibilities(pt)) {
                                    const possible = _iterant_38;
                                    if (comboSet.has(possible)) {
                                        continue;
                                    }
                                    sudoku.removePossibility(pt, possible);
                                }
                            }
                        }
                    }
                }
            };
            const combinations = _bzbSupportLib_0.require(6).combinations;
            _exports_0.hiddenSets = hiddenSets;
        }
    });
    {
        const Sudoku = _bzbSupportLib_0.require(7).Sudoku;
        const _imports_3 = _bzbSupportLib_0.require(6), range = _imports_3.range, keys = _imports_3.keys;
        const hiddenSets = _bzbSupportLib_0.require(8).hiddenSets;
        self.onmessage = function (e) {
            const _patternPlaceholder_18 = e.data, _iterator_23 = _patternPlaceholder_18[Symbol.iterator](), id = _iterator_23.next().value, _ph_0 = _iterator_23.next().value, specs = _ph_0.specs, initial = _ph_0.initial, ticks = _ph_0.ticks, _patternPlaceholder_19 = initial, point = _patternPlaceholder_19.point, value = _patternPlaceholder_19.value, sudoku = new Sudoku(specs.size);
            for (let _iterant_39 of keys(specs.mappings)) {
                const ptcode = _iterant_39;
                const value = specs.mappings[ptcode], pt = sudoku.decode(+ptcode);
                sudoku.set(pt, +value, true);
            }
            sudoku.set(point, +value, true);
            sudoku.changes.addListener(function (setting) {
                self.postMessage({
                    id,
                    done: false,
                    value: setting
                });
            });
            for (let _iterant_40 of range(0, ticks)) {
                const i = _iterant_40;
                for (let _iterant_41 of range(1, 5)) {
                    const n = _iterant_41;
                    hiddenSets(sudoku, n);
                    sudoku.update();
                }
            }
            self.postMessage({
                id,
                done: true,
                value: undefined
            });
        };
    }
}());

//# sourceMappingURL=worker.js.map