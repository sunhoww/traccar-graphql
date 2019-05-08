import run from 'rollup-plugin-run';
import pkg from './package.json';

const dev = process.env.ROLLUP_WATCH === 'true';

export default {
  input: 'src/index.js',
  output: { file: 'dist/index.js', format: 'cjs' },
  plugins: [
    dev &&
      run({
        execArgv: ['-r', 'dotenv/config'],
      }),
  ],
  external: Object.keys(pkg.dependencies),
};
