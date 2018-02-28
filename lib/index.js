'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _effects = require('redux-saga/effects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RESTART = '@@saga/RESTART';
var FAIL = '@@saga/FAIL';

exports.default = function (saga) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$defaultBehavior = _ref.defaultBehavior,
      defaultBehavior = _ref$defaultBehavior === undefined ? RESTART : _ref$defaultBehavior,
      _ref$disableWarnings = _ref.disableWarnings,
      disableWarnings = _ref$disableWarnings === undefined ? false : _ref$disableWarnings,
      _ref$maxAttempts = _ref.maxAttempts,
      maxAttempts = _ref$maxAttempts === undefined ? 3 : _ref$maxAttempts,
      onEachError = _ref.onEachError,
      onFail = _ref.onFail;

  var attempts = 0;
  var lastError = null;

  return (/*#__PURE__*/_regenerator2.default.mark(function restart() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var shouldStop, nextAction, getNextAction, result;
      return _regenerator2.default.wrap(function restart$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(attempts < maxAttempts)) {
                _context.next = 23;
                break;
              }

              _context.prev = 1;
              _context.next = 4;
              return _effects.call.apply(undefined, [saga].concat(args));

            case 4:
              _context.next = 21;
              break;

            case 6:
              _context.prev = 6;
              _context.t0 = _context['catch'](1);

              lastError = _context.t0;
              shouldStop = false;

              if (!(onEachError instanceof Function)) {
                _context.next = 17;
                break;
              }

              nextAction = void 0;

              getNextAction = function getNextAction(action) {
                nextAction = action;
              };

              _context.next = 15;
              return (0, _effects.call)(onEachError, getNextAction, _context.t0, saga.name, attempts);

            case 15:
              result = nextAction || defaultBehavior;

              shouldStop = result === FAIL;

            case 17:
              if (!shouldStop) {
                _context.next = 19;
                break;
              }

              return _context.abrupt('break', 23);

            case 19:
              attempts += 1;
              if (!disableWarnings) {
                // eslint-disable-next-line no-console
                console.warn('Restarting ' + saga.name + ' because of error');
              }

            case 21:
              _context.next = 0;
              break;

            case 23:
              if (!(onFail instanceof Function)) {
                _context.next = 28;
                break;
              }

              _context.next = 26;
              return onFail(lastError, saga.name, attempts);

            case 26:
              _context.next = 29;
              break;

            case 28:
              if (!disableWarnings) {
                // eslint-disable-next-line no-console
                console.warn('Saga ' + saga.name + ' failed after ' + attempts + '/' + maxAttempts + ' attempts without any onFail handler');
              }

            case 29:
            case 'end':
              return _context.stop();
          }
        }
      }, restart, this, [[1, 6]]);
    })
  );
};