import glob from 'glob';
import { of } from 'java-properties';
import clear from 'clear';
import chalk from 'chalk';
import figlet from 'figlet';
import emoji from 'node-emoji';
import fs from 'fs-extra';

const usage = () => {
  clear();
  console.log(
    chalk.yellow(
      figlet.textSync('properties-linter', { horizontalLayout: 'full' })
    )
  );
};

const ok = (file) => {
  console.log(emoji.get('white_check_mark') + chalk.white(`  ${file}`));
};

const error = (file, err) => {
  console.log(emoji.get('fire') + chalk.bold.red(`  ${file}`));
  console.log(chalk.yellow(`    ${err.message}`));
};

const errorLint = (file, result) => {
  console.log(emoji.get('fire') + chalk.bold.red(`  ${file}`));
  result.errors.forEach(err => {
    console.log(chalk.yellow(`    line ${err.lineNo}: ${err.message} (${err.value.slice(0, 10)})`));
  });
};


const lint = (file) => {
  const contents = fs.readFileSync(file).toString();
  const lines = contents.split(/\r?\n/);
  const result = { errors: [], problems: 0 };
  const regexComments = new RegExp('^\\s*[#!]+', 'm');
  const regexKey = new RegExp('^\\s*\\w+=.*', 'm');
  const regexLineBreak = /[\\]\s*$$/;
  lines.forEach((line, index) => {
    if(!regexComments.test(line)) {
      if(!regexKey.test(line)) {
        if(!regexLineBreak.test(lines[index - 1])) {
          result.errors.push({lineNo: index + 1, value: line, type: 'error', message: 'Malformed key'});
          result.problems++;
        }
      }
    }
  });
  return result;
};

const main = (path) => {
  usage();
  const pattern = `${path}/**/*.properties`;
  glob(pattern, null, (err, files) => {
    console.log(chalk.bold.white(`Processing '${pattern}'...`));
    console.log();

    files.forEach(file => {
      try {
        const values = of(file);
        const result = lint(file);
        if(result.problems === 0) {
          ok(file);
        } else {
          errorLint(file, result);
        }
      } catch(e) {
        error(file, e);
      }
    });
  });
};

export default main;
