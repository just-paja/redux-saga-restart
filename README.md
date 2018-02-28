# react-redux-restart

[![CircleCI](https://circleci.com/gh/just-paja/react-saga-rest.svg?style=shield)](https://circleci.com/gh/just-paja/react-saga-rest)
[![Maintainability](https://api.codeclimate.com/v1/badges/03e0f05df495ab09b664/maintainability)](https://codeclimate.com/github/just-paja/react-saga-rest/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/03e0f05df495ab09b664/test_coverage)](https://codeclimate.com/github/just-paja/react-saga-rest/test_coverage)

Don't let your sagas die just like that. Catch the errors, allow them to try again.

## Example

```javascript
import keepAlive from 'redux-saga-restart';
import myUndyingSaga from './myUndyingSaga';
import myMortalSaga from './myMortalSaga';

function* onEachError(next, error, saga) {
  yield put({ type: 'SAGA_ERROR' });
}

function* onFail(error, saga) {
  console.warn(`Your saga ${sagaName} will not be restarted anymore`);
  yield put({ type: 'FATAL_ERROR' });
}

const sagas = [
  myMortalSaga,
  keepAlive(myUndyingSaga, {
    onEachError,
    onFail,
  })
]

export default function* rootSaga() {
  yield all(sagas.map(saga => fork(saga)));
}
```

## API

### keepAlive(saga, options)

Pass any saga and options. When an error kills it, the keepAlive wrapper will restart it again until it runs out of attempts. If no error handler is passed, sagas will trigger warnings to the console.

```javascript
{
  defaultBehavior = RESTART,
  disableWarnings = false,
  maxAttempts = 3,
  onEachError,
  onFail,
}
```

### onFail(error, sagaName, attempts)

Execute any action when saga fails. It can be either a function or another saga.

```javascript
import { put } from 'redux-saga/effects';
import keepAlive from 'redux-saga-restart';

function* onFail(error) {
  yield put({ type: 'FATAL_ERROR', error });
}

keepAlive(saga, {
  onFail,
});
```

### onFail(error, sagaName, attempts)

Execute any action when saga is killed by error and decide if it is restarted or not. It can be either a function or another saga.

```javascript
import { put } from 'redux-saga/effects';
import keepAlive, { FAIL, RESTART } from 'redux-saga-restart';

function* logEachError(next, error, sagaName) {
  logError(error);
}

function* killOnEachError(next, error) {
  yield put({ type: 'FATAL_ERROR', error });
  next(FAIL);
}

keepAlive(saga, {
  onEachError: killOnEachError,
  /* Including defaultBehavior despite this
     is its default value just to be obvious */
  defaultBehavior: RESTART,
});
```

### maxAttempts

Configure maximum number of restart attempts.

```javascript
import keepAlive from 'redux-saga-restart';
keepAlive(saga, {
  maxAttempts: 100,
});
```

### Whitelist instead of blacklist

Library provides constants that shape the default behavior of the keepAlive function.

* RESTART (the default) - Saga will be restarted unless told othwerwise
* FAIL - Saga will not be restarted unless told otherwise.

```javascript
import keepAlive from 'redux-saga-restart';
keepAlive(saga, {
  defaultBehavior: FAIL,
});
```
