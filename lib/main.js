'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _javaProperties = require('java-properties');

var _clear = require('clear');

var _clear2 = _interopRequireDefault(_clear);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _figlet = require('figlet');

var _figlet2 = _interopRequireDefault(_figlet);

var _nodeEmoji = require('node-emoji');

var _nodeEmoji2 = _interopRequireDefault(_nodeEmoji);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var usage = function usage() {
  (0, _clear2.default)();
  console.log(_chalk2.default.yellow(_figlet2.default.textSync('properties-linter', { horizontalLayout: 'full' })));
};

var ok = function ok(file) {
  console.log(_nodeEmoji2.default.get('white_check_mark') + _chalk2.default.white('  ' + file));
};

var error = function error(file, err) {
  console.log(_nodeEmoji2.default.get('fire') + _chalk2.default.bold.red('  ' + file));
  console.log(_chalk2.default.yellow('    ' + err.message));
};

var errorLint = function errorLint(file, result) {
  console.log(_nodeEmoji2.default.get('fire') + _chalk2.default.bold.red('  ' + file));
  result.errors.forEach(function (err) {
    console.log(_chalk2.default.yellow('    line ' + err.lineNo + ': ' + err.message + ' (' + err.value.slice(0, 10) + ')'));
  });
};

var lint = function lint(file) {
  var contents = _fsExtra2.default.readFileSync(file).toString();
  var lines = contents.split(/\r?\n/);
  var result = { errors: [], problems: 0 };
  var regexComments = new RegExp('^\\s*[#!]+', 'm');
  var regexKey = new RegExp('^\\s*\\w+=.*', 'm');
  var regexLineBreak = /[\\]\s*$$/;
  lines.forEach(function (line, index) {
    if (!regexComments.test(line)) {
      if (!regexKey.test(line)) {
        if (!regexLineBreak.test(lines[index - 1])) {
          result.errors.push({ lineNo: index + 1, value: line, type: 'error', message: 'Malformed key' });
          result.problems++;
        }
      }
    }
  });
  return result;
};

var main = function main(path) {
  usage();
  var pattern = path + '/**/*.properties';
  (0, _glob2.default)(pattern, null, function (err, files) {
    console.log(_chalk2.default.bold.white('Processing \'' + pattern + '\'...'));
    console.log();

    files.forEach(function (file) {
      try {
        var values = (0, _javaProperties.of)(file);
        var result = lint(file);
        if (result.problems === 0) {
          ok(file);
        } else {
          errorLint(file, result);
        }
      } catch (e) {
        error(file, e);
      }
    });
  });
};

exports.default = main;