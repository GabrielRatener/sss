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
        '2': function (_exports_0) {
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
            const Stream = _bzbSupportLib_0.require(1).Stream;
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
        '3': function (_exports_0) {
            const node = function (value) {
                    return {
                        value: value,
                        next: undefined,
                        prev: undefined
                    };
                }, Queue = function () {
                    let head, ass, length = 0;
                    this.enqueue = function (value) {
                        let _opvar_7;
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
                    this.dequeue = function () {
                        let _opvar_8;
                        if (length === 0) {
                            throw new Error('Cannot pop');
                        } else {
                            let _opvar_9;
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
                        let _opvar_10;
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
                };
            _exports_0.Queue = Queue;
        },
        '4': function (_exports_0) {
            const promiseController = function () {
                    const ctrl = {};
                    ctrl.promise = new Promise(function (win, fail) {
                        ctrl.fulfill = win;
                        ctrl.reject = fail;
                    });
                    return ctrl;
                }, observerController = function () {
                    const ctrl = {};
                    ctrl.observer = new Observer(function (send, close, raise) {
                        ctrl.send = send;
                        ctrl.close = close;
                        ctrl.raise = raise;
                    });
                    return ctrl;
                }, all = function () {
                    const args = _bzbSupportLib_0.restargs(arguments, 0);
                    return Promise.all(args);
                }, race = function () {
                    const args = _bzbSupportLib_0.restargs(arguments, 0);
                    return Promise.race(args);
                }, raceIndex = function () {
                    const args = _bzbSupportLib_0.restargs(arguments, 0);
                    const control = function (win, fail) {
                        for (let _iterant_5 of enumerate(args)) {
                            const _iterator_4 = _iterant_5[Symbol.iterator](), i = _iterator_4.next().value, promise = _iterator_4.next().value;
                            const proceed = function () {
                                win(i);
                            }.bind(this);
                            promise.then(proceed, fail);
                        }
                    }.bind(this);
                    return new Promise(control);
                }, Observer = function (func) {
                    const update = function () {
                            while (!(fulfillers.isEmpty() || values.isEmpty())) {
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
                        }, send = function (value) {
                            if (done) {
                                throw new Error('Observer is closed, cannot send to it!');
                            }
                            values.enqueue(value);
                            update();
                        }, close = function (value) {
                            if (done) {
                                throw new Error('Observer is closed, cannot re-close it!');
                            }
                            done = true;
                            endvalue = value;
                            update();
                        }, raise = function (value) {
                            if (done) {
                                throw new Error('Observer is closed, cannot raise error on it!');
                            }
                            error = true;
                            close(value);
                        };
                    let fulfillers = new Queue(), values = new Queue(), done = false, endvalue = undefined, error = false;
                    this.next = function () {
                        return new Promise(function (win, fail) {
                            fulfillers.enqueue({
                                win,
                                fail
                            });
                            update();
                        });
                    };
                    func(send, close, raise);
                }, lockableBinder = function () {
                    const ctrl = observerController();
                    run(_bzbSupportLib_0.async(function* () {
                        const _lefthandPlaceholder_1 = ctrl.observer[_bzbSupportLib_0.symbols.observer]();
                        while (true) {
                            const _observerController_1 = yield _lefthandPlaceholder_1.next();
                            if (_observerController_1.done)
                                break;
                            const func = _observerController_1.value;
                            yield func();
                        }
                    }));
                    return function (id, action, fn) {
                        const el = document.getElementById(id);
                        el.addEventListener(action, function (e) {
                            const bfn = fn.bind(el, e);
                            ctrl.send(bfn);
                        });
                    };
                };
            const _imports_0 = _bzbSupportLib_0.require(2), Observable = _imports_0.Observable, idgen = _imports_0.idgen, run = _imports_0.run, enumerate = _imports_0.enumerate;
            const Queue = _bzbSupportLib_0.require(3).Queue;
            const symbols = _bzbSupportLib_0.require(0).symbols;
            const newid = idgen();
            Observer.prototype[symbols.observer] = function () {
                return this;
            };
            _exports_0.promiseController = promiseController;
            _exports_0.observerController = observerController;
            const resolve = Promise.resolve.bind(Promise), reject = Promise.reject.bind(Promise);
            _exports_0.resolve = resolve;
            _exports_0.reject = reject;
            _exports_0.all = all;
            _exports_0.race = race;
            _exports_0.raceIndex = raceIndex;
            _exports_0.Observer = Observer;
            const EventSource = class extends Observable {
                constructor(func) {
                    super();
                    const fire = function (e) {
                        for (let _iterant_6 of this._listeners) {
                            const _iterator_5 = _iterant_6[Symbol.iterator](), key = _iterator_5.next().value, listener = _iterator_5.next().value;
                            listener(e);
                        }
                    }.bind(this);
                    this._listeners = new Map();
                    if (func !== undefined) {
                        func(fire);
                    }
                }
                addListener(func) {
                    let _opvar_11;
                    if (func === undefined) {
                        throw new Error('What?');
                    }
                    const id = newid();
                    this._listeners.set(id, func);
                    return id;
                }
                removeListener(id) {
                    this._listeners.delete(id);
                }
                observe() {
                    return new Observer(function (send, close) {
                        this.addListener(send);
                    }.bind(this));
                }
                map(fn) {
                    return new EventSource(function (fire) {
                        this.addListener(function (data) {
                            fire(fn(data));
                        });
                    }.bind(this));
                }
            };
            _exports_0.EventSource = EventSource;
            const CloseableEventSource = _bzbSupportLib_0.classify(class extends EventSource {
                constructor(func) {
                    super();
                    let closeEvent;
                    const fire = function (e) {
                        for (let _iterant_7 of this._listeners) {
                            const _iterator_6 = _iterant_7[Symbol.iterator](), key = _iterator_6.next().value, listener = _iterator_6.next().value;
                            listener(e);
                        }
                    }.bind(this);
                    const close = function (e) {
                        closeEvent(e);
                    }.bind(this);
                    this.end = new EventSource(function (fire) {
                        closeEvent = fire;
                    }.bind(this));
                    if (func !== undefined) {
                        func(fire, close);
                    }
                }
                observe() {
                    return new Observer(function (send, close) {
                        const closer = function (e) {
                            close(e);
                            this.removeListener(serial);
                            this.end.removeListener(terminal);
                        }.bind(this);
                        const serial = this.addListener(send), terminal = this.end.addListener(closer);
                    }.bind(this));
                }
                map(fn) {
                    return new CloseableEventSource(function (fire, close) {
                        const id = this.addListener(function (data) {
                            fire(fn(data));
                        }.bind(this));
                        this.end.addListener(function (data) {
                            this.removeListener(id);
                        }.bind(this));
                    }.bind(this));
                }
            }, {
                reduce: _bzbSupportLib_0.async(function* (fn, initial) {
                    let index = 0, summation = initial;
                    const _lefthandPlaceholder_0 = this[_bzbSupportLib_0.symbols.observer]();
                    while (true) {
                        const _observerController_0 = yield _lefthandPlaceholder_0.next();
                        if (_observerController_0.done)
                            break;
                        const e = _observerController_0.value;
                        summation = fn(summation, e, index, this);
                        index += 1;
                    }
                    return summation;
                })
            });
            _exports_0.CloseableEventSource = CloseableEventSource;
            _exports_0.lockableBinder = lockableBinder;
        },
        '5': function (_exports_0) {
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
        '6': function (_exports_0) {
            const _imports_1 = _bzbSupportLib_0.require(5), range = _imports_1.range, keys = _imports_1.keys;
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
        '7': function (_exports_0) {
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
        '8': function (_exports_0) {
            const blib = _bzbSupportLib_0.require(0)[_bzbSupportLib_0.symbols.default];
            const Queue = _bzbSupportLib_0.require(7).Queue;
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
        '9': function (_exports_0) {
            const initialSet = function (n) {
                    const set = new Set();
                    for (let _iterant_8 of range(0, n)) {
                        const i = _iterant_8;
                        set.add(i + 1);
                    }
                    return set;
                }, toJSON = function (sudoku) {
                    return sudoku.toJSON();
                }, fromJSON = function (json) {
                    const sudoku = new Sudoku(json.size);
                    for (let _iterant_9 of keyvals(json.mappings)) {
                        const _iterator_7 = _iterant_9[Symbol.iterator](), position = _iterator_7.next().value, value = _iterator_7.next().value;
                        const pt = sudoku.decode(+position);
                        sudoku.set(pt, +value);
                    }
                    return sudoku;
                };
            const _imports_2 = _bzbSupportLib_0.require(6), range = _imports_2.range, zip = _imports_2.zip, keyvals = _imports_2.keyvals;
            const EventObservable = _bzbSupportLib_0.require(8).EventObservable;
            const _imports_3 = _bzbSupportLib_0.require(2), tuple = _imports_3.tuple, printSet = _imports_3.printSet;
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
                    for (let _iterant_10 of range(0, this._size)) {
                        const i = _iterant_10;
                        if (copymode) {
                            this._grid[i] = new Array(this._size);
                            continue;
                        }
                        const arr = new Array(this._size);
                        for (let _iterant_11 of range(0, arr.length)) {
                            const j = _iterant_11;
                            arr[j] = initialSet(this._size);
                        }
                        this._grid[i] = arr;
                    }
                }
                copy() {
                    const copied = new Sudoku(this._size, {}, true);
                    copied._count = this._count;
                    for (let _iterant_12 of range(0, this._size)) {
                        const x = _iterant_12;
                        for (let _iterant_13 of range(0, this._size)) {
                            const y = _iterant_13;
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
                    const _iterator_8 = _patternPlaceholder_4[Symbol.iterator](), x = _iterator_8.next().value, y = _iterator_8.next().value;
                    const value = this._grid[y][x];
                    if (value instanceof Set) {
                        return 0;
                    } else {
                        return value;
                    }
                }
                set(_patternPlaceholder_5, value, quiet, update) {
                    const _iterator_10 = _patternPlaceholder_5[Symbol.iterator](), x = _iterator_10.next().value, y = _iterator_10.next().value;
                    quiet = quiet === undefined ? false : quiet;
                    update = update === undefined ? true : update;
                    if (this._grid[y][x] instanceof Set) {
                        let _opvar_14;
                        this._count += 1;
                        this._grid[y][x] = +value;
                        for (let _iterant_14 of this.collectionsAt([
                                x,
                                y
                            ])) {
                            const collection = _iterant_14;
                            for (let _iterant_15 of collection.iterate()) {
                                const _iterator_9 = _iterant_15[Symbol.iterator](), i = _iterator_9.next().value, j = _iterator_9.next().value;
                                let _opvar_12, _opvar_13;
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
                    const _iterator_11 = _patternPlaceholder_6[Symbol.iterator](), x = _iterator_11.next().value, y = _iterator_11.next().value;
                    return !(this._grid[y][x] instanceof Set);
                }
                isPossible(_patternPlaceholder_7, value) {
                    const _iterator_12 = _patternPlaceholder_7[Symbol.iterator](), x = _iterator_12.next().value, y = _iterator_12.next().value;
                    const val = this._grid[y][x];
                    if (val instanceof Set) {
                        return val.has(value);
                    } else {
                        let _opvar_15;
                        return val === value;
                    }
                }
                getPossibilities(_patternPlaceholder_8, value) {
                    const _iterator_13 = _patternPlaceholder_8[Symbol.iterator](), x = _iterator_13.next().value, y = _iterator_13.next().value;
                    const val = this._grid[y][x];
                    if (val instanceof Set) {
                        return new Set(val);
                    } else {
                        return new Set([val]);
                    }
                }
                removePossibility(_patternPlaceholder_9, value) {
                    const _iterator_14 = _patternPlaceholder_9[Symbol.iterator](), x = _iterator_14.next().value, y = _iterator_14.next().value;
                    const val = this._grid[y][x];
                    if (val instanceof Set) {
                        if (val.has(value)) {
                            val.delete(value);
                        }
                    }
                }
                update() {
                    for (let _iterant_16 of this.emptyPoints()) {
                        const _iterator_15 = _iterant_16[Symbol.iterator](), x = _iterator_15.next().value, y = _iterator_15.next().value;
                        let _opvar_16;
                        const set = this._grid[y][x];
                        if (!(set.size === 1)) {
                            continue;
                        }
                        for (let _iterant_17 of set) {
                            const val = _iterant_17;
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
                    const _iterator_16 = _patternPlaceholder_10[Symbol.iterator](), x = _iterator_16.next().value, y = _iterator_16.next().value;
                    const left = 3 * Math.floor(x / 3), top = 3 * Math.floor(y / 3);
                    return new Box(this._boxSize, tuple(left, top));
                }
                rowAt(_patternPlaceholder_11) {
                    const _iterator_17 = _patternPlaceholder_11[Symbol.iterator](), x = _iterator_17.next().value, y = _iterator_17.next().value;
                    return new Row(this._size, [
                        0,
                        y
                    ]);
                }
                columnAt(_patternPlaceholder_12) {
                    const _iterator_18 = _patternPlaceholder_12[Symbol.iterator](), x = _iterator_18.next().value, y = _iterator_18.next().value;
                    return new Column(this._size, [
                        x,
                        0
                    ]);
                }
                *boxes() {
                    const boxSize = round(sqrt(this._size));
                    for (let _iterant_18 of range(0, boxSize)) {
                        const x = _iterant_18;
                        for (let _iterant_19 of range(0, boxSize)) {
                            const y = _iterant_19;
                            yield new Box(this._boxSize, tuple(boxSize * x, boxSize * y));
                        }
                    }
                    return;
                }
                *allCollections() {
                    for (let _iterant_20 of zip(range(0, this._size), this.boxes())) {
                        const _iterator_19 = _iterant_20[Symbol.iterator](), i = _iterator_19.next().value, box = _iterator_19.next().value;
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
                    let _opvar_17;
                    return this._area === this._count;
                }
                encode(_patternPlaceholder_13) {
                    const _iterator_20 = _patternPlaceholder_13[Symbol.iterator](), x = _iterator_20.next().value, y = _iterator_20.next().value;
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
                    for (let _iterant_21 of range(0, this._size)) {
                        const x = _iterant_21;
                        for (let _iterant_22 of range(0, this._size)) {
                            const y = _iterant_22;
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
                    for (let _iterant_23 of range(0, this._size)) {
                        const y = _iterant_23;
                        for (let _iterant_24 of range(0, this._size)) {
                            const x = _iterant_24;
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
                    for (let _iterant_25 of range(0, this._size)) {
                        const x = _iterant_25;
                        for (let _iterant_26 of range(0, this._size)) {
                            const y = _iterant_26;
                            if (!(this._grid[y][x] instanceof Set)) {
                                continue;
                            }
                            yield tuple(x, y);
                        }
                    }
                }
                range(_patternPlaceholder_14) {
                    const _iterator_21 = _patternPlaceholder_14[Symbol.iterator](), x = _iterator_21.next().value, y = _iterator_21.next().value;
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
                    for (let _iterant_27 of range(0, this._size)) {
                        const x = _iterant_27;
                        for (let _iterant_28 of range(0, this._size)) {
                            const y = _iterant_28;
                            let _opvar_18;
                            const value = this.get([
                                x,
                                y
                            ]);
                            if (value === 0) {
                                let _opvar_19;
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
                                for (let _iterant_29 of pairs) {
                                    const _iterator_22 = _iterant_29[Symbol.iterator](), house = _iterator_22.next().value, hash = _iterator_22.next().value;
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
                    let _patternPlaceholder_15 = this._point, _iterator_23 = _patternPlaceholder_15[Symbol.iterator](), x0 = _iterator_23.next().value, y0 = _iterator_23.next().value;
                    for (let _iterant_30 of range(0, this._size)) {
                        const x = _iterant_30;
                        for (let _iterant_31 of range(0, this._size)) {
                            const y = _iterant_31;
                            yield tuple(x0 + x, y0 + y);
                        }
                    }
                    return;
                }
            }, { type: 'box' });
            _exports_0.Box = Box;
            const Column = _bzbSupportLib_0.classify(class extends Collection {
                *iterate() {
                    let _patternPlaceholder_16 = this._point, _iterator_24 = _patternPlaceholder_16[Symbol.iterator](), x0 = _iterator_24.next().value, y0 = _iterator_24.next().value;
                    for (let _iterant_32 of range(0, this._size)) {
                        const y = _iterant_32;
                        yield tuple(x0, y);
                    }
                }
            }, { type: 'column' });
            _exports_0.Column = Column;
            const Row = _bzbSupportLib_0.classify(class extends Collection {
                *iterate() {
                    let _patternPlaceholder_17 = this._point, _iterator_25 = _patternPlaceholder_17[Symbol.iterator](), x0 = _iterator_25.next().value, y0 = _iterator_25.next().value;
                    for (let _iterant_33 of range(0, this._size)) {
                        const x = _iterant_33;
                        yield tuple(x, y0);
                    }
                }
            }, { type: 'row' });
            _exports_0.Row = Row;
        },
        '10': function (_exports_0) {
            const sink = function () {
            };
            const _imports_4 = _bzbSupportLib_0.require(2), range = _imports_4.range, run = _imports_4.run, tuple = _imports_4.tuple, idgen = _imports_4.idgen;
            const CloseableEventSource = _bzbSupportLib_0.require(4).CloseableEventSource;
            const getid = idgen();
            const WorkerPool = class {
                constructor(path, n) {
                    const onmessage = function (_patternPlaceholder_19) {
                        const id = _patternPlaceholder_19.data.id, done = _patternPlaceholder_19.data.done, value = _patternPlaceholder_19.data.value;
                        if (!this._pipeTable.has(id)) {
                            throw new Error('Worker sent invalid id!');
                        }
                        const _patternPlaceholder_18 = this._pipeTable.get(id), _iterator_26 = _patternPlaceholder_18[Symbol.iterator](), fire = _iterator_26.next().value, close = _iterator_26.next().value;
                        if (done) {
                            this._pipeTable.delete(id);
                            close(value);
                        } else {
                            fire(value);
                        }
                    }.bind(this);
                    this._path = path;
                    this._n = n;
                    this._target = 0;
                    this._workers = new Array(n);
                    this._pipeTable = new Map();
                    for (let _iterant_34 of range(0, n)) {
                        const i = _iterant_34;
                        const worker = new Worker(path);
                        worker.onmessage = onmessage;
                        this._workers[i] = worker;
                    }
                }
                result(data) {
                    let _opvar_20;
                    const controller = function (win, fail) {
                        const pair = tuple(sink, win, fail);
                        this._pipeTable.set(id, pair);
                    }.bind(this);
                    const worker = this._workers[this._target], id = getid(), prom = new Promise(controller);
                    this._target += 1;
                    if (this._target === this._workers.length) {
                        this._target = 0;
                    }
                    worker.postMessage(tuple(id, data));
                    return prom;
                }
                resultStream(data) {
                    let _opvar_21;
                    const controller = function (fire, close, err) {
                        const pair = tuple(fire, close, err);
                        this._pipeTable.set(id, pair);
                    }.bind(this);
                    const worker = this._workers[this._target], id = getid(), pipe = new CloseableEventSource(controller);
                    this._target += 1;
                    if (this._target === this._workers.length) {
                        this._target = 0;
                    }
                    worker.postMessage(tuple(id, data));
                    return pipe;
                }
                close() {
                    const error = new Error('Workers terminated!');
                    for (let _iterant_35 of this._workers) {
                        const worker = _iterant_35;
                        worker.terminate();
                    }
                    for (let _iterant_36 of this._pipeTable) {
                        const _iterator_28 = _iterant_36[Symbol.iterator](), id = _iterator_28.next().value, ctrl = _iterator_28.next().value;
                        const _patternPlaceholder_20 = ctrl, _iterator_27 = _patternPlaceholder_20[Symbol.iterator](), send = _iterator_27.next().value, close = _iterator_27.next().value, err = _iterator_27.next().value;
                        this._pipeTable.delete(id);
                        if (err !== undefined) {
                            err(error);
                        }
                    }
                }
            };
            _exports_0.WorkerPool = WorkerPool;
        },
        '11': function (_exports_0) {
            const hiddenSets = function (sudoku, n, collection) {
                collection = collection === undefined ? null : collection;
                let _opvar_22;
                if (collection === null) {
                    for (let _iterant_37 of sudoku.allCollections()) {
                        const group = _iterant_37;
                        hiddenSets(sudoku, n, group);
                    }
                } else {
                    let _opvar_23;
                    const tried = new Set(), val2points = new Map(), vals = [];
                    for (let _iterant_38 of collection.iterate()) {
                        const pt = _iterant_38;
                        const ptcode = sudoku.encode(pt);
                        if (sudoku.determined(pt)) {
                            continue;
                        }
                        for (let _iterant_39 of sudoku.getPossibilities(pt)) {
                            const val = _iterant_39;
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
                    for (let _iterant_40 of combinations(vals, n)) {
                        const combo = _iterant_40;
                        let _opvar_24;
                        const points = new Set();
                        for (let _iterant_41 of combo) {
                            const val = _iterant_41;
                            for (let _iterant_42 of val2points.get(val)) {
                                const ptcode = _iterant_42;
                                points.add(ptcode);
                            }
                        }
                        if (points.size === n) {
                            const comboSet = new Set(combo);
                            for (let _iterant_43 of points) {
                                const ptcode = _iterant_43;
                                const pt = sudoku.decode(ptcode);
                                if (sudoku.determined(pt)) {
                                    continue;
                                }
                                for (let _iterant_44 of sudoku.getPossibilities(pt)) {
                                    const possible = _iterant_44;
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
            const combinations = _bzbSupportLib_0.require(2).combinations;
            _exports_0.hiddenSets = hiddenSets;
        },
        '12': function (_exports_0) {
            const tileValueEliminate = _bzbSupportLib_0.async(function* (sudoku) {
                const size = sudoku.size();
                for (let _iterant_45 of sudoku.emptyPoints()) {
                    const point = _iterant_45;
                    const _patternPlaceholder_21 = point, _iterator_29 = _patternPlaceholder_21[Symbol.iterator](), x = _iterator_29.next().value, y = _iterator_29.next().value, box = sudoku.boxAt([
                            x,
                            y
                        ]), row = sudoku.rowAt([
                            x,
                            y
                        ]), col = sudoku.columnAt([
                            x,
                            y
                        ]), all = cat(box.iterate(), row.iterate(), col.iterate());
                    for (let _iterant_46 of all) {
                        const pt = _iterant_46;
                        let _opvar_25, _opvar_26;
                        const _patternPlaceholder_22 = pt, _iterator_30 = _patternPlaceholder_22[Symbol.iterator](), i = _iterator_30.next().value, j = _iterator_30.next().value;
                        if (i === x && j === y) {
                            continue;
                        }
                        if (!sudoku.determined(pt)) {
                            continue;
                        }
                        sudoku.removePossibility([
                            x,
                            y
                        ], sudoku.get(pt));
                    }
                }
            });
            const cat = _bzbSupportLib_0.require(2).cat;
            _exports_0.tileValueEliminate = tileValueEliminate;
        },
        '13': function (_exports_0) {
            const transfer = function (origin, dest) {
                    for (let _iterant_47 of dest.emptyPoints()) {
                        const pt = _iterant_47;
                        const val = origin.get(pt);
                        dest.set(pt, val);
                    }
                }, brutalize = function (sudoku) {
                    const empty = Array.from(sudoku.emptyPoints());
                    let guesses = new Set([sudoku]);
                    empty.sort(function (a, b) {
                        return sudoku.range(a) - sudoku.range(b);
                    }.bind(this));
                    for (let _iterant_48 of empty) {
                        const pt = _iterant_48;
                        const set = new Set();
                        for (let _iterant_49 of guesses) {
                            const guessGrid = _iterant_49;
                            let _opvar_27;
                            const possible = guessGrid.getPossibilities(pt);
                            if (possible.size < 2) {
                                set.add(guessGrid);
                                continue;
                            }
                            _label_0:
                                for (let _iterant_50 of possible) {
                                    const possibility = _iterant_50;
                                    const tester = guessGrid.copy();
                                    tester.set(pt, possibility);
                                    for (let _iterant_51 of range(0, 2)) {
                                        const i = _iterant_51;
                                        for (let _iterant_52 of range(2, 4)) {
                                            const n = _iterant_52;
                                            hiddenSets(tester, n);
                                            tester.update();
                                        }
                                        tileValueEliminate(tester);
                                        tester.update();
                                        if (!tester.validate()) {
                                            continue _label_0;
                                        } else {
                                            if (tester.completed()) {
                                                transfer(tester, sudoku);
                                                return;
                                            }
                                        }
                                    }
                                    set.add(tester);
                                }
                        }
                        guesses = set;
                    }
                };
            const range = _bzbSupportLib_0.require(5).range;
            const tileValueEliminate = _bzbSupportLib_0.require(12).tileValueEliminate;
            const hiddenSets = _bzbSupportLib_0.require(11).hiddenSets;
            _exports_0.brutalize = brutalize;
        },
        '14': function (_exports_0) {
            const missing = function* (set, n) {
                    n = n === undefined ? 9 : n;
                    for (let _iterant_53 of range(0, n)) {
                        const i = _iterant_53;
                        if (!set.has(i)) {
                            yield i;
                        }
                    }
                }, firstMissing = function (set, n) {
                    n = n === undefined ? 9 : n;
                    for (let _iterant_54 of missing(set, n)) {
                        const miss = _iterant_54;
                        return miss;
                    }
                }, encrypt = function (arr) {
                    let newarr = arr.slice(0);
                    return newarr.join('-');
                }, ensemble = function (sudoku, ics, ticks) {
                    const n = ics.length, pool = new Array(n), changes = new Map();
                    for (let _iterant_55 of range(0, n)) {
                        const i = _iterant_55;
                        const _patternPlaceholder_23 = ics[i], point = _patternPlaceholder_23.point, value = _patternPlaceholder_23.value;
                        pool[i] = sudoku.copy();
                        pool[i].onset = function (_patternPlaceholder_24) {
                            const value = _patternPlaceholder_24.value, point = _patternPlaceholder_24.point;
                            const code = sudoku.encode(point), hash = '' + code + '-' + value + '';
                            if (changes.has(hash)) {
                                let _opvar_28;
                                let count = changes.get(hash);
                                count += 1;
                                if (count === n) {
                                    if (!sudoku.determined(point)) {
                                        sudoku.set(point, value);
                                    }
                                } else {
                                    changes.set(hash, count);
                                }
                            } else {
                                changes.set(hash, 1);
                            }
                        };
                        pool[i].set(point, value, true);
                    }
                    for (let _iterant_56 of range(0, ticks)) {
                        const i = _iterant_56;
                        for (let _iterant_57 of pool) {
                            const simulator = _iterant_57;
                            tileValueEliminate(simulator);
                        }
                    }
                }, ensembleAsync = function (sudoku, ics, ticks) {
                    const workHandler = _bzbSupportLib_0.async(function* (i) {
                        let counter = 0;
                        const data = {
                            ticks,
                            specs: json,
                            initial: ics[i]
                        };
                        const _lefthandPlaceholder_2 = workers.resultStream(data)[_bzbSupportLib_0.symbols.observer]();
                        while (true) {
                            const _observerController_2 = yield _lefthandPlaceholder_2.next();
                            if (_observerController_2.done)
                                break;
                            const change = _observerController_2.value;
                            const _patternPlaceholder_25 = change, point = _patternPlaceholder_25.point, value = _patternPlaceholder_25.value, code = sudoku.encode(point), hash = '' + code + '-' + value + '';
                            if (changes.has(hash)) {
                                let _opvar_29;
                                let count = changes.get(hash);
                                count += 1;
                                if (count === n) {
                                    if (!sudoku.determined(point)) {
                                        sudoku.set(point, value);
                                    }
                                } else {
                                    changes.set(hash, count);
                                }
                            } else {
                                changes.set(hash, 1);
                            }
                        }
                    });
                    const n = ics.length, promises = new Array(n), changes = new Map(), json = sudoku.toJSON();
                    for (let _iterant_58 of range(0, n)) {
                        const i = _iterant_58;
                        const ic = ics[i], prom = run(workHandler.bind(null, i));
                        promises[i] = prom;
                    }
                    return Promise.all(promises);
                }, ensembleEliminate = function (sudoku, max, ticks) {
                    ticks = ticks === undefined ? 3 : ticks;
                    for (let _iterant_59 of sudoku.emptyPoints()) {
                        const point = _iterant_59;
                        let _opvar_30;
                        const possible = sudoku.getPossibilities(point);
                        if (!(possible.size > max)) {
                            const ics = new Array(possible.size);
                            for (let _iterant_60 of enumerate(possible)) {
                                const _iterator_31 = _iterant_60[Symbol.iterator](), i = _iterator_31.next().value, value = _iterator_31.next().value;
                                ics[i] = {
                                    point,
                                    value
                                };
                            }
                            ensemble(sudoku, ics, ticks);
                        }
                    }
                }, ensembleEliminateAsync = function (sudoku, max, ticks) {
                    ticks = ticks === undefined ? 3 : ticks;
                    const promises = [];
                    for (let _iterant_61 of sudoku.emptyPoints()) {
                        const point = _iterant_61;
                        let _opvar_31;
                        const possible = sudoku.getPossibilities(point);
                        if (!(possible.size > max)) {
                            const ics = new Array(possible.size);
                            for (let _iterant_62 of enumerate(possible)) {
                                const _iterator_32 = _iterant_62[Symbol.iterator](), i = _iterator_32.next().value, value = _iterator_32.next().value;
                                ics[i] = {
                                    point,
                                    value
                                };
                            }
                            promises.push(ensembleAsync(sudoku, ics, ticks));
                        }
                    }
                    return Promise.all(promises);
                }, brutalizeAsync = function (sudoku) {
                    let _opvar_33;
                    const pool = new WorkerPool('bf-worker.js', 3), buff = [], json = toJSON(sudoku);
                    let result = null, point = null;
                    for (let _iterant_63 of sudoku.emptyPoints()) {
                        const pt = _iterant_63;
                        let _opvar_32;
                        if (sudoku.range(pt) === 3) {
                            point = pt;
                            break;
                        }
                    }
                    if (point === null) {
                        for (let _iterant_64 of sudoku.emptyPoints()) {
                            const pt = _iterant_64;
                            let _opvar_34;
                            if (sudoku.range(pt) > 3) {
                                point = pt;
                                break;
                            }
                        }
                    }
                    for (let _iterant_65 of sudoku.getPossibilities(point)) {
                        const value = _iterant_65;
                        const result = pool.result({
                            specs: json,
                            initial: {
                                point,
                                value
                            }
                        });
                        buff.push(result);
                    }
                    return {
                        done: Promise.race(buff).then(function (res) {
                            pool.close();
                            result = res;
                        }.bind(this)),
                        transfer: function (sudoku) {
                            for (let _iterant_66 of keyvals(result.mappings)) {
                                const _iterator_33 = _iterant_66[Symbol.iterator](), code = _iterator_33.next().value, value = _iterator_33.next().value;
                                const pt = sudoku.decode(code);
                                if (sudoku.determined(pt)) {
                                    continue;
                                } else {
                                    sudoku.set(pt, +value);
                                }
                            }
                        },
                        halt: function () {
                            pool.close();
                        }
                    };
                }, solver = _bzbSupportLib_0.async(function* (sudoku) {
                    let bf = true;
                    sudoku.game = true;
                    for (let _iterant_67 of range(0, 2)) {
                        const i = _iterant_67;
                        yield ensembleEliminateAsync(sudoku, 3, 10);
                        sudoku.update();
                        if (sudoku.completed()) {
                            bf = false;
                            break;
                        }
                        for (let _iterant_68 of range(1, 6)) {
                            const i = _iterant_68;
                            hiddenSets(sudoku, i);
                            sudoku.update();
                        }
                        if (sudoku.completed()) {
                            bf = false;
                            break;
                        }
                    }
                    if (bf) {
                        const ctrl = brutalizeAsync(sudoku);
                        yield ctrl.done;
                        ctrl.transfer(sudoku);
                    }
                    sudoku.game = false;
                    return sudoku.completed();
                });
            const tuple = _bzbSupportLib_0.require(5).tuple;
            const _imports_5 = _bzbSupportLib_0.require(6), range = _imports_5.range, zip = _imports_5.zip, enumerate = _imports_5.enumerate, keyvals = _imports_5.keyvals;
            const _imports_6 = _bzbSupportLib_0.require(2), cat = _imports_6.cat, combinations = _imports_6.combinations, run = _imports_6.run;
            const WorkerPool = _bzbSupportLib_0.require(10).WorkerPool;
            const _imports_7 = _bzbSupportLib_0.require(9), Box = _imports_7.Box, toJSON = _imports_7.toJSON;
            const hiddenSets = _bzbSupportLib_0.require(11).hiddenSets;
            const brutalize = _bzbSupportLib_0.require(13).brutalize;
            const raceIndex = _bzbSupportLib_0.require(4).raceIndex;
            const workers = new WorkerPool('worker.js', 3);
            _exports_0.solver = solver;
        },
        '15': function (_exports_0) {
            const levels = {
                '1': [
                    '437806201010030804000000530009108020000090000080305100026000000703010050805903712',
                    '000067009137090000650130040070400000241903678000006050060028094000010532900340000',
                    '034900501910020000000100096601702030370000018020501604250003000000050083403006750',
                    '050400103000000070026030408042070900509301207008060340601020590090000000805004060',
                    '830900001006302004070806000000000492290104067487000000000601040100408200600003079',
                    '750006090000080041090010256600002080029060170080700009874050030910070000030400017',
                    '003608700000004501700905280200003690060090010091800007076309005408200000002506100',
                    '510690008490800500000500107059070001080306050100050240908004000005009072700085064',
                    '053090001090075200100802000820006000360748025000500083000403007001250090500080360',
                    '940100706200800450000003800683014000700090004000260385004900000079001002802006043',
                    '019000004037605012200004000060582003000906000700413060000800006640307280300000140',
                    '504290030079045068200070005010000080040608070020000050700080009450910620090062807',
                    '125408039097000010830100000040900600008306100002005090000002067070000580560704923',
                    '700000481003010070210980006060173000300408005000596030800041062030060500647000003',
                    '000201060000058701005607340026000159900000003154000670081409200203860000090103000',
                    '090000700000076000000398145610050204020000080803010057589123000000460000001000020',
                    '002097080900300700000000591600742008720805014800913007549000000007006009080130400',
                    '000149080003250006204008001009010005046000130100070600400700809900065700050891000',
                    '854600000060010504970000080030104050009725300080906010090000037103070040000001925',
                    '708930004000008009306000207040089320009020600031450070107000803900800000400091706',
                    '020400578005001400000508003037980100040000050006052340400306000001800900379005080',
                    '008905000030012000001630475059023000300080007000190540963074200000350060000201800',
                    '580601020031405000600980000756000890400000001012000637000096002000204970040103068',
                    '001060034050409060000102007502047100106000705009210603400901000070304010910020400',
                    '071008402934700080600000070009050030203804107040070200090000008050007916306900720',
                    '037608152010000074000001630900007080100903006070200005094500000260000040753804290',
                    '603017900807003600000004008000300100379201584008009000400100000002900401005470209',
                    '000704900034905806000000245000249030000000000060518000523000000608107390009302000',
                    '080029003200307600007040920870000009000618000100000046095080100001205008400960050',
                    '097040500605001002000506080506080000204010607000020108040709000700100403009060870',
                    '000002507800000004970608203082067100007050300004230760209506071700000006406100000',
                    '009006030070039250683005000500300470000417000046002001000500123012780060030600800',
                    '065080001170050003002000047200047089400306005610590004920000700700010096500070310',
                    '030059280008007000740013000314020908000000000805090342000180079000900500029570010',
                    '064003000908076020050204680790800000800307001000002075043609050070430106000700340',
                    '300207800045000020700501034800005040009803500010400003150309002070000190004102006',
                    '001004020030009000070650091008506109052040760603807200120065080000900070080700500',
                    '060030900002090001008405007879003012000218000620500483200904100300080700004060090',
                    '032009008064008000000000930450920780016403590089071064095000000000800140300100670',
                    '530019008000600002800200900017802500905040201008901360003004005700006000200190036',
                    '054100000316205480708000100002800009500409001600003800007000503039702648000006970',
                    '009203005053080000280071603508600000300807006000004807807130049000040160400905700',
                    '008004170975300006006000000687030095000829000240050813000000600700006942062900300',
                    '200041009040000150501006003050000604063000590908000020100600908094000070800730005',
                    '020800600083070290670509004040100060056000940090006070900204038064030150008005020',
                    '805490001302008090000006842000004058026000930980200000239600000010300709600019403',
                    '032409760640300090790010003004003900020000050003800200300020079050008034076901580',
                    '000901700900050008030000492260039507050060020708510034412000080600020005005608000',
                    '400008561080305002200000843007080050000709000060050400752000006800602070196500004',
                    '301007050280504001095602000920000065000709000740000089000308510100905026050100907'
                ],
                '2': [
                    '091800000800500420000030009657000103000179000904000278400020000028007006000008930',
                    '300500000040030750098040200000018503010000090705360000007020360069070040000005007',
                    '030007140007903800906008007001005000070000020000200400800300906003509200094100030',
                    '000605870500008300098370600000002060005000900040900000009061540006200008051403000',
                    '000200054000800900037090000760450209080020070102073048000040830004002000320006000',
                    '008000069010000405000064200050100080790040053080002090004810000901000020860000500',
                    '025890043000540008400200000089000026500000009630000450000002004800074000270058930',
                    '207500006059600030600030000005408090000010000060207100000080003090006520500003804',
                    '004083002780020000301900000003600007070302040500001900000005604000010073600470200',
                    '017090604000004009000006580000530007008020900400069000094600000700200000805010240',
                    '000503078730840009002001004000009030900000007040100000500200700400065092260704000',
                    '500021060007065000000000500024009016060040020710600390003000000000510600050730002',
                    '003005004008037020000004710800000060100402008060000009076300000080290400400700300',
                    '032600080608254003900000000004107009006000700200403800000000008100926407060008390',
                    '790800000006070000005030672200001090901080704070900001519040300000090400000003057',
                    '090040300043500080002900000030680100001000500005024060000001700050009240007060090',
                    '800020954200008000005070000009500031050182060180003500000010300000700005561030002',
                    '270000081500400000001600300002900570700000004085002100004006800000008003930000046',
                    '216005907040970600009002000000130720000000000078024000000200400002053060607400285',
                    '000090020095000010430000006082070100009863500003040680900000064050000290060010000',
                    '400000000030070280810600009900030800380020045007050003500007096046010030000000002',
                    '003009000009030562600080000200600470060493010094007006000040007416070300000800600',
                    '006201000081000059200709001054010000000365000000020510300804005860000170000106900',
                    '000800000803690000070531080060013540004000300098240060040368020000059607000007000',
                    '000004086024760300600005700700000400200647005003000007006300002002079560180400000',
                    '000300000004980603000000201207001304005020800301600509109000000508069400000007000',
                    '008100003690003500070460900000600050800010007050008000005047060001800032700001400',
                    '104706900009000000600004700005340080800651004010028300007400009000000600001209807',
                    '000300090008605072700000436193007000000000000000400289816000007370104600020006000',
                    '060300000100024060053091700004000300092030640005000200007140890080570002000009050',
                    '006000021031070908090280630000820000900000006000054000048092060502030410170000300',
                    '003540007001009060000106005290300000005497600000005019300804000050900400900012300',
                    '007093042000080009001000006035400000010509030000008150900000200800060000140950700',
                    '065000020002056003800003004230005000004060900000400036700200005900670100020000390',
                    '090050021200009006010200030430080600800000003001020049050002070300100004140070060',
                    '004500010060000000000891340007210800200080007009057400045163000000000050080005700',
                    '029605400508000700000001000650700004000569000100004025000900000005000306004308570',
                    '700802001000403020100060004098000206007000900301000580800040002010609000600201009',
                    '010049052054300090020050000501802700000000000007504206000030060040006930670910020',
                    '003905200070010059040600010000007803000000000608500000030001060480030020006209400',
                    '004001003030004050009020018700600540000070000015008002140030700060800020800100300',
                    '100050002049037500000200309300000000086000240000000003503002000008640920600090007',
                    '735049000001070000840000070000005701460010089507400000070000015000050800000180624',
                    '071580004000470008900006000809050400060040010004090307000700003700064000600015740',
                    '305000180020000030004601007050400010600020003010008050500207300070000040039000705',
                    '407000100601400002500009003900700030000205000070006008700900004800002501009000706',
                    '003007800050000067000004150006080010200306008040050300034700000160000080009200600',
                    '006050900010809000003201050051007000700080002000900610080602300000508060004090200',
                    '040068500500900400097450000006180070009000100080094200000037620005002009003610040',
                    '000600480020180790007200610000006000105000207000300000058002300094073020012009000'
                ],
                '3': [
                    '300816090900030000000900703006500000780000059000004200809005000000040006040368005',
                    '000000070004380001050007623300018000000070000000250008516800090800091400070000000',
                    '500001000000070300810609500029000006040000030700000820002506043007090000000300001',
                    '500608000002005041060000000000503907605000104708106000000000070240700500000904002',
                    '800700301000010080029530000050000000016309470000000060000045890040080000305007004',
                    '000000006400708900000001073090000025050694080740000030260100000004209007100000000',
                    '600583000300000000050900060270000040006435200080000095090007080000000001000164002',
                    '070080005010009008000054690400000010150000082090000003062930000500400030300010070',
                    '000002086005100030000080090000400825004000700652001000070010000060008300920300000',
                    '100090208508000010400008000000106020002903800080407000000600005060000402307040009',
                    '007002050000043100006000040600400095002000300890007006060000400001390000080200700',
                    '053020609000900700020004000070600090500000006060001080000300040006007000205040360',
                    '200400000000038056090005003047001000006000800000800940400700080370180000000004002',
                    '000015800840300000000800307090200100560000034004003070301008000000001089008460000',
                    '400050070000037900000008001000001250078000160056900000900800000005720000030060007',
                    '003000040907080000008100500006805000704060108000704300001003200000050903080000400',
                    '057003010400009030300504200040000700000901000002000080003105006070200001060700940',
                    '000823074600000091000000800000200709000341000402006000009000000230000006870592000',
                    '200009004600040001040520900760000000020807040000000092009064080400090005800300009',
                    '010075360000340500000000007050002900420000078009100040800000000005026000064530080',
                    '105003000020000050046090300560400000008030600000007014003010480070000060000800203',
                    '560040002700001630030005000005000809020000050301000200000400060096700008200050047',
                    '070690000890003000053012000000900073000080000130006000000250390000700082000039040',
                    '000500100305090700070000205030807000500409003000601050103000080009010406002008000',
                    '005849200000000030406003005200000490100000007079000002600200701040000000002164500',
                    '020600015804002000910007020400090500000000000008030009040900081000500702360008050',
                    '005910260000000905860500300000040000107000504000090000001004058506000000074053600',
                    '048210700000040000200008900000000032087000410630000000001500007000020000009036540',
                    '470001800060009040003000000007020003605000402900080700000000300090400060002900054',
                    '007100400803045000000008020500000604070050080306000001030900000000710902002003700',
                    '040007009000000000350906047600370900007000300003064002810409036000000000900600050',
                    '001045020680000000040031700204050900000000000003010502009120070000000041010470200',
                    '082300007600480093000000806000050000803000709000030000508000000160075008400008260',
                    '006009048700500002020000600289005000007000500000900381003000050800004006470800100',
                    '235000001000000470000090058010040600090602030006070040670020000028000000900000523',
                    '005020009480310000001000074307800020000000000090002705510000200000081037600050900',
                    '000200090602000800093007000000070943005000100917030000000900510009000702060004000',
                    '402180000080090700030600800001000080093000540060000900009001050007050030000036102',
                    '600080002010600003050020600000005940070104080093800000005010030300002070900050004',
                    '300058200000600057005000010020007090050080070040300020030000600980006000004720005',
                    '700009010809001700050072003900200600000000000008006002400560030003400109060900008',
                    '286000000045000010300005600900026700000704000007910004002800009060000140000000372',
                    '400008000085090026300002500807000050000020000020000109003400002910050470000300005',
                    '080010900040008060710060300000000605090301070804000000009080056050100040008070030',
                    '500040000020010090004002650790004000080000070000200018035900100010060030000070002',
                    '100390070009600502060500009004003005000000000300400200200005040506008100010047008',
                    '002000010000004720490080006000042000837000492000870000200060041076400000040000500',
                    '040000020007860910200500000000007080409000305070400000000006007028059100030000090',
                    '800002000503090100000800070102035006006000200900260304060008000008050903000400007',
                    '070000020006005300900000800012056000300907004000320510001000002009400100080000060'
                ],
                '4': [
                    '047000000600008000080710400300056000002000900000290007003071050000300001000000690',
                    '900020500000000084000653090009005701000000000702300400090417000520000000004060003',
                    '000005010600010800010480007000000920004601500032000000200058070009070005080200000',
                    '000008000800000403094005010400080357000000000539070004040700580301000009000600000',
                    '000020300004008900090001050005000090019030470030000100070500060006100200001070000',
                    '604071008000004030000002750300000000015000280000000007023100000070400000800260403',
                    '080079000000500094000100370003400006040000010500001800091002000270005000000890060',
                    '070106002000009000000350806002000580000040000018000400304091000000400000700508020',
                    '003400008000000306052700000000060907006090800207080000000005630604000000500001400',
                    '050690700000000005300100600000005204280000093401900000008004001600000000007081050',
                    '004510000010049000063007000300070800500000009008050001000100720000790080000085100',
                    '000006093000000000018003720001020000503000804000060200074500930000000000850200000',
                    '000070000726003000000402530050700002001000300600008010095306000000800649000010000',
                    '890006000050740003004000000000000306009301400708000000000000900100059070000400068',
                    '006000040000070002020810005050600300007020900003005080600049070100050000030000200',
                    '000000000060230070800009054600007020900103007070500008290400001040015090000000000',
                    '240005000063000078000007000790030000004208300000010056000100000920000830000800069',
                    '900005400800000000030019002040700100307000905006003070400980010000000007001600009',
                    '000010008350400000000300709070800024100000006920006080204009000000004061600020000',
                    '905007008300020000080000760052090000700000004000080270093000080000050007200600509',
                    '000006301005001006000090200000800060830000014060005000008050000200100800509700000',
                    '008000600000900007300020510904200700000010000007006108075080001400009000001000300',
                    '700980050428100900000000000170000200000708000006000043000000000004005367050026009',
                    '300070801600300900000100000060000400870000093004000060000008000002006009103090005',
                    '700060090600200300050000007060000003009325400300000010400000060007001008030080001',
                    '890006300050039070000000500000057001000000000100460000005000000010920060002700048',
                    '020700000010006200980000000004062007800070001200980600000000039009500070000003060',
                    '500040000001002508000000630070005100805000307003600080057000000608300400000020009',
                    '006705020080004000700200960100000030400000009020000001048003006000800070050406100',
                    '060050000000000510001009820005260000300040007000098200059800100034000000000070040',
                    '009060000074009001000304000500600800092000670001007002000708000700400350000030700',
                    '800900300000800500042000790050030004000509000300060020027000410003001000009007003',
                    '000103600070000001605070000503008004000050000900400805000090703400000080007201000',
                    '060030000780009040004000209307080000090000050000040903608000400030200087000070090',
                    '004000060600800500720060000050010400030502070007080030000020016001004008080000300',
                    '008090001000051008620070000080002000204000703000900050000020064800430000700060900',
                    '300050000107002900040800000016000000095060470000000280000006040004900708000040003',
                    '800003000170049000043000180096700000000000000000006540038000450000980021000400006',
                    '000060095008300000004000603800206000100050007000804009607000300000007500350040000',
                    '000300060040009800200010000089002300006030400003500910000060001008200030010003000',
                    '002008564000000000700052030004000083000503000690000100020140007000000000139700600',
                    '080000502600003400050900070000005008009000700100400000070004020001300007502000060',
                    '000305900005000001000124603003000095000000000280000100308792000400000800009801000',
                    '000300000000070903150809000007600030800000002090005100000107085604090000000003000',
                    '038009005000004000704203000005028000600000009000940300000607201000800000100400760',
                    '042097000000100000030406005209000300000080000008000206300209050000008000000610870',
                    '000008090004060001060940800000000038400207005180000000006095020900020700020400000',
                    '000900000320001060481002000000620008700000003900073000000100357070300024000007000',
                    '067300000000500600000004210050409030200000007030207060089100000002008000000005890',
                    '000016009000030078904500000095000004001000800300000610000001302140080000500340000',
                    '800000000003600000070090200050007000000045700000100030001000068008500010090000400'
                ]
            };
            _exports_0.levels = levels;
        }
    });
    {
        const fadeIn = function (_patternPlaceholder_27, value) {
                const _iterator_34 = _patternPlaceholder_27[Symbol.iterator](), x = _iterator_34.next().value, y = _iterator_34.next().value;
                let id = 'i' + (9 * y + x) + '', el = document.getElementById(id);
                el.style.transform = 'rotateY(180deg)';
                el.style.color = 'white';
                el.style.backgroundColor = 'black';
                el.value = '' + value + '';
                return new Promise(function (win, fail) {
                    el.addEventListener('animationend', win);
                    el.style.animationName = 'unflip';
                }).then(function () {
                    el.style.transform = '';
                    el.style.animationName = '';
                }.bind(this));
            }, clear = _bzbSupportLib_0.async(function* (pt, all) {
                all = all === undefined ? true : all;
                if (all) {
                    for (let _iterant_69 of range(0, 9)) {
                        const x = _iterant_69;
                        for (let _iterant_70 of range(0, 9)) {
                            const y = _iterant_70;
                            clear([
                                x,
                                y
                            ], false);
                        }
                    }
                    state.clear();
                } else {
                    let _patternPlaceholder_28 = pt, _iterator_35 = _patternPlaceholder_28[Symbol.iterator](), x = _iterator_35.next().value, y = _iterator_35.next().value, id = 'i' + (9 * y + x) + '', el = document.getElementById(id);
                    el.value = '';
                    el.style.color = '';
                    el.style.backgroundColor = '';
                }
            }), original = _bzbSupportLib_0.async(function* (pt, all) {
                all = all === undefined ? true : all;
                if (all) {
                    const buff = [];
                    for (let _iterant_71 of range(0, 9)) {
                        const x = _iterant_71;
                        for (let _iterant_72 of range(0, 9)) {
                            const y = _iterant_72;
                            buff.push(original([
                                x,
                                y
                            ], false));
                        }
                    }
                    yield Promise.all(buff);
                } else {
                    let _patternPlaceholder_29 = pt, _iterator_36 = _patternPlaceholder_29[Symbol.iterator](), x = _iterator_36.next().value, y = _iterator_36.next().value, code = 9 * y + x;
                    yield clear(pt, false);
                    if (state.has(code)) {
                        document.getElementById('i' + code).value = state.get(code);
                    }
                }
            }), solve = _bzbSupportLib_0.async(function* () {
                const sudoku = new Sudoku();
                let done;
                document.getElementById('solve').classList.add('solving');
                state.clear();
                for (let _iterant_73 of range(0, 81)) {
                    const i = _iterant_73;
                    let _opvar_35;
                    const x = i % 9, y = Math.floor(i / 9), id = 'i' + i + '', el = document.getElementById(id), val = +el.value;
                    if (val === 0) {
                        continue;
                    }
                    sudoku.set([
                        x,
                        y
                    ], val, true);
                    state.set(i, val);
                }
                done = run(_bzbSupportLib_0.async(function* () {
                    let i = 0, buff = [];
                    const _lefthandPlaceholder_3 = sudoku.changes[_bzbSupportLib_0.symbols.observer]();
                    while (true) {
                        const _observerController_3 = yield _lefthandPlaceholder_3.next();
                        if (_observerController_3.done)
                            break;
                        const _patternPlaceholder_30 = _observerController_3.value, point = _patternPlaceholder_30.point, value = _patternPlaceholder_30.value;
                        if ((i + 1) % 20 === 0) {
                            yield fadeIn(point, value);
                            buff = [];
                        } else {
                            buff.push(fadeIn(point, value));
                        }
                        i += 1;
                    }
                    yield Promise.all(buff);
                }));
                if (yield solver(sudoku)) {
                    yield done;
                }
                document.getElementById('solve').classList.remove('solving');
            }), randomSudoku = function (level) {
                let _opvar_37;
                if (0 < level && level < 5) {
                    const all = levels[level], index = floor(all.length * random());
                    return all[index];
                } else {
                    throw new Error('Level ${level} does not exist!');
                }
            }, generate = _bzbSupportLib_0.async(function* () {
                yield clear();
                set(randomSudoku(4));
            });
        const _imports_8 = _bzbSupportLib_0.require(2), sleep = _imports_8.sleep, tube = _imports_8.tube, range = _imports_8.range, run = _imports_8.run, enumerate = _imports_8.enumerate, combinations = _imports_8.combinations;
        const _imports_9 = _bzbSupportLib_0.require(4), all = _imports_9.all, race = _imports_9.race, resolve = _imports_9.resolve, lockableBinder = _imports_9.lockableBinder;
        const Sudoku = _bzbSupportLib_0.require(9).Sudoku;
        const solver = _bzbSupportLib_0.require(14).solver;
        const levels = _bzbSupportLib_0.require(15).levels;
        const _patternPlaceholder_26 = Math, round = _patternPlaceholder_26.round, min = _patternPlaceholder_26.min, max = _patternPlaceholder_26.max, random = _patternPlaceholder_26.random, floor = _patternPlaceholder_26.floor;
        const state = new Map();
        const bind = lockableBinder();
        window.set = function (string) {
            for (let _iterant_74 of enumerate(string)) {
                const _iterator_37 = _iterant_74[Symbol.iterator](), i = _iterator_37.next().value, c = _iterator_37.next().value;
                let _opvar_38;
                if (c === '0') {
                    continue;
                } else {
                    document.getElementById('i' + i + '').value = c;
                }
            }
        };
        window.onload = function () {
            bind('solve', 'click', solve);
            bind('original', 'click', original);
            bind('clear', 'click', clear);
            bind('generate', 'click', generate);
        };
    }
}());

//# sourceMappingURL=main.js.map