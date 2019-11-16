
const {freeze} = Object;

export const tuple = (...args) => {
    return freeze([...args]);
}

export const range = (start, end, step = 1) => {
    let i = start;

    return {
        [Symbol.iterator]() {
            return this;
        },

        next() {
            if (i < end) {
                const value = i;

                i += step;

                return {
                    value,
                    done: false
                }
            } else {
                return {
                    done: true
                }
            }
        }
    }
}

export const enumerate = function * (iterator) {
    let i = 0;

    for (const value of iterator) {
        yield tuple(i, value);

        i++;
    }
}

export const first = (iterator) => {
    for (const val of iterator) {
        return val;
    }

    throw new Error('No values to iterate!');
}

export const sleep = (ms = 1000) => {
    return new Promise((done) => {
        setTimeout(() => done(), ms);
    });
}