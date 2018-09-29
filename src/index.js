import { call } from 'redux-saga/effects';

const RESTART = '@@saga/RESTART';
const FAIL = '@@saga/FAIL';

const warn = (disableWarnings, warning) => {
  if (!disableWarnings) {
    // eslint-disable-next-line no-console
    console.warn(warning);
  }
};

export default (saga, {
  defaultBehavior = RESTART,
  disableWarnings = false,
  maxAttempts = 3,
  onEachError,
  onFail,
} = {}) => {
  let attempts = 0;
  let lastError = null;

  return function* restart(...args) {
    while (attempts < maxAttempts) {
      try {
        yield call(saga, ...args);
      } catch (error) {
        lastError = error;
        let shouldStop = false;
        if (typeof onEachError === 'function') {
          let nextAction;
          const getNextAction = (action) => { nextAction = action; };
          yield call(onEachError, getNextAction, error, saga.name, attempts);
          const result = nextAction || defaultBehavior;
          shouldStop = result === FAIL;
        }
        if (shouldStop) {
          break;
        }
        attempts += 1;
        warn(disableWarnings, `Restarting ${saga.name} because of error`);
      }
    }
    if (typeof onFail === 'function') {
      yield onFail(lastError, saga.name, attempts);
    } else if (!disableWarnings) {
      warn(disableWarnings, `Saga ${saga.name} failed after ${attempts}/${maxAttempts} attempts without any onFail handler`);
    }
  };
};
