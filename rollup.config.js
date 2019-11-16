
import defscript from "rollup-plugin-defscript"
import svelte from "rollup-plugin-svelte"
import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import postcss from "rollup-plugin-postcss"

const production = !process.env.ROLLUP_WATCH;

export default {
    input: './src/main.dfs',
    plugins: [
        svelte({
			emitCss: true,

			// enable run-time checks when not in production
            dev: !production,
            
			// // we'll extract any component CSS out into
			// // a separate file — better for performance
			// css: css => {
			// 	css.write('public/dist/bundle.css');
			// }
		}),
        defscript({}),
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),
		postcss({
			extract: true,
			minimize: true,
			use: [
				[
					'sass',
					{
						includePaths: [
							'./theme',
							'./node_modules'
						]
					}
				]
			]
		})
    ],
    output: {
        file: './public/dist/main.js',
        name: 'app',
        format: 'iife'
    }
}