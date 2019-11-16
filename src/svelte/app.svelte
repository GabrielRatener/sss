<script>

    import Button from "@smui/button"
    import {fade, fly} from "svelte/transition"

    import {sleep} from "../utils"
    import {solve, sudokuFromString} from "../sudoku.dfs"
    import sudokuList from "../sudoku-db.dfs"

    const {floor, random} = Math;

    const SOLVING = 1, SOLVED = 2, ENTER = 3;

    const SIZE = 9;

    const QUEUE_MAX = 6;

    const createModel = (size = SIZE) => {
        const model = [];

        for (let i = 0; i < size; i++) {
            const row = [];

            for (let j = 0; j < size; j++) {
                row.push('');
            }

            model.push(row);
        }

        return model;
    }

    const model = createModel();

    const putSudoku = (string) => {
        status = ENTER;

        for (let i = 0; i < string.length; i++) {
            model[floor(i / SIZE)][i % SIZE] =
              (string[i] === '0') ?
                '' :
                string[i];
        }
    }

    const getSudoku = () => {
        let string = '';

        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                string +=
                  (!!model[i][j]) ?
                    model[i][j] :
                    '0';
            }
        }

        return string;
    }

    const solveSudoku = async () => {
        const string = getSudoku()
        const sudoku = sudokuFromString(string);
        const changeQueue = [];

        const dequeue = () => {
            // clear change queue and reveal in grid...
            for (const change of changeQueue.splice(0)) {
                model[floor(change.index / 9)][change.index % 9] = '' + change.value;
            }
        }

        savedSudoku = string

        status = SOLVING;

        for (const {type, changes} of solve(sudoku)) {

            let fills = 0, eliminations = 0;

            for (const change of changes) {

                if (change.type === 'fill') {
                    fills += 1;

                    changeQueue.push(change);

                    if (changeQueue.length >= QUEUE_MAX) {
                        dequeue();
                        await sleep(500);
                    }
                } else {

                    eliminations += 1;
                }
            }

            console.log(`${type} (${fills} fills and ${eliminations} eliminations)`);
        }

        // dequeue any remaining values
        dequeue();
    }

    const clearSudoku = () => {
        const empty = '0';

        putSudoku(empty.repeat(81));
    }

    const resetSudoku = () => {
        putSudoku(savedSudoku)
    }

    const randomSudoku = (level = 0) => {
        const list = sudokuList[level];
        const sudoku = list[floor(list.length * random())];
        
        putSudoku(sudoku);
    }

    const testAlgorithm = () => {
        const total =
          sudokuList
            .map(list => list.length)
            .reduce((total, length) => total + length, 0)

        let successes = 0;

        for (let i = 0; i < sudokuList.length; i++) {
            for (const string of sudokuList[i]) {
                const sudoku = sudokuFromString(string);

                for (const iteration of solve(sudoku)) {
                    // nothing to do here...
                }

                if (sudoku.completed()) {
                    successes += 1;
                }
            }
        }

        console.log('success rate:', successes, '/', total);
    }

    let savedSudoku = null;

    let status = ENTER;

</script>

<div id="content">
    <table>
        {#each model as row, j}
            <tr>
                {#each row as value, i}
                    <td
                        class="inp"
                        class:rig={i === 2 || i === 5}
                        class:dow={j === 2 || j === 5}
                        >
                        <div>
                            <input
                                type="text"
                                maxlength="1"
                                disabled={status === SOLVING}
                                bind:value={row[i]}
                                class:fill={
                                    status === SOLVING &&
                                    savedSudoku[j * 9 + i] === '0' &&
                                    !!row[i]
                                }
                                />
                        </div>
                    </td>
                {/each}
            </tr>
        {/each}
    </table>

    <div id="control_bar">
        <Button
            variant="raised"
            color="secondary"
            on:click={() => solveSudoku()}
            >
            Solve
        </Button>
        <Button
            variant="raised"
            color="primary"
            on:click={() => clearSudoku()}
            >
            Clear
        </Button>
        <Button
            variant="raised"
            color="primary"
            on:click={() => resetSudoku()}
            >
            Reset
        </Button>
        <Button
            variant="raised"
            color="primary"
            on:click={() => randomSudoku(2)}
            >
            Random
        </Button>


        <!-- <Button variant="raised" on:click={() => testAlgorithm()}>Test</Button> -->
    </div>
</div>

