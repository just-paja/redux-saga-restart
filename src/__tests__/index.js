import SagaTester from 'redux-saga-tester';

import { put } from 'redux-saga/effects';

import keepAlive from '..';

describe('Keep alive', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not die when options are not passed', () => {
    function* testSaga() {
      yield put({ type: 'TEST_ACTION' });
    }

    expect(() => {
      keepAlive(testSaga);
    }).not.toThrow();
  });

  it('fails saga when onEachError returns FAIL and triggers onFail', () => {
    const onEachError = jest.fn().mockImplementation((...args) => args[0]('@@saga/FAIL'));
    const onFail = jest.fn();
    const sagaTester = new SagaTester({
      initialState: {},
      reducers: {
        test: (state = {}) => state,
      },
    });
    const error = new Error('Saga failed on purpose');

    function* testSaga() {
      yield put({ type: 'TEST_ACTION' });
      throw error;
    }

    const wrapped = keepAlive(testSaga, {
      onEachError,
      onFail,
    });

    sagaTester.start(wrapped);
    sagaTester.reset();
    expect(sagaTester.numCalled('TEST_ACTION')).toBe(1);
    expect(onEachError).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledTimes(1);
  });

  it('does not die on saga fail given onEachError is not function', () => {
    const onError = jest.fn();
    const sagaTester = new SagaTester({
      initialState: {},
      reducers: {
        test: (state = {}) => state,
      },
      options: {
        onError,
      },
    });
    const error = new Error('Saga failed on purpose');

    function* testSaga() {
      yield put({ type: 'TEST_ACTION' });
      throw error;
    }

    const wrapped = keepAlive(testSaga, {
      onFail: () => {},
    });
    sagaTester.start(wrapped);
    sagaTester.reset();
    expect(onError).not.toHaveBeenCalled();
  });

  it('does not die on saga fail given onEachError is not function', () => {
    const onError = jest.fn();
    const sagaTester = new SagaTester({
      initialState: {},
      reducers: {
        test: (state = {}) => state,
      },
      options: {
        onError,
      },
    });
    const error = new Error('Saga failed on purpose');

    function* testSaga() {
      yield put({ type: 'TEST_ACTION' });
      throw error;
    }

    const wrapped = keepAlive(testSaga, {
      onEachError: () => {},
    });
    sagaTester.start(wrapped);
    sagaTester.reset();
    expect(onError).not.toHaveBeenCalled();
  });

  it('triggers console warning on saga fail given onEachError is not function', () => {
    const onError = jest.fn();
    const sagaTester = new SagaTester({
      initialState: {},
      reducers: {
        test: (state = {}) => state,
      },
      options: {
        onError,
      },
    });
    const error = new Error('Saga failed on purpose');

    function* testSaga() {
      yield put({ type: 'TEST_ACTION' });
      throw error;
    }

    const wrapped = keepAlive(testSaga, {
      onEachError: () => {},
    });
    sagaTester.start(wrapped);
    sagaTester.reset();
    // eslint-disable-next-line no-console
    expect(console.warn).toHaveBeenCalled();
  });

  it('triggers console warning on saga restart given warnings are enabled', () => {
    const onError = jest.fn();
    const sagaTester = new SagaTester({
      initialState: {},
      reducers: {
        test: (state = {}) => state,
      },
      options: {
        onError,
      },
    });
    const error = new Error('Saga failed on purpose');

    function* testSaga() {
      yield put({ type: 'TEST_ACTION' });
      throw error;
    }

    const wrapped = keepAlive(testSaga, {
      onEachError: () => {},
      onFail: () => {},
    });
    sagaTester.start(wrapped);
    sagaTester.reset();
    // eslint-disable-next-line no-console
    expect(console.warn).toHaveBeenCalled();
  });

  it('triggers console warning on saga restart given warnings are disabled', () => {
    const onError = jest.fn();
    const sagaTester = new SagaTester({
      initialState: {},
      reducers: {
        test: (state = {}) => state,
      },
      options: {
        onError,
      },
    });
    const error = new Error('Saga failed on purpose');

    function* testSaga() {
      yield put({ type: 'TEST_ACTION' });
      throw error;
    }

    const wrapped = keepAlive(testSaga, {
      onEachError: () => {},
      onFail: () => {},
    });
    sagaTester.start(wrapped);
    sagaTester.reset();
    // eslint-disable-next-line no-console
    expect(console.warn).toHaveBeenCalled();
  });

  it('does not trigger console warning on saga fail given onEachError is not function and warnings are disabled', () => {
    const onError = jest.fn();
    const sagaTester = new SagaTester({
      initialState: {},
      reducers: {
        test: (state = {}) => state,
      },
      options: {
        onError,
      },
    });
    const error = new Error('Saga failed on purpose');

    function* testSaga() {
      yield put({ type: 'TEST_ACTION' });
      throw error;
    }

    const wrapped = keepAlive(testSaga, {
      disableWarnings: true,
      onEachError: () => {},
    });
    sagaTester.start(wrapped);
    sagaTester.reset();
    // eslint-disable-next-line no-console
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('keeps alive saga until maximum number of attempts when not stopped', () => {
    const onEachError = jest.fn();
    const onFail = jest.fn();
    const sagaTester = new SagaTester({
      initialState: {},
      reducers: {
        test: (state = {}) => state,
      },
    });
    const error = new Error('Saga failed on purpose');

    function* testSaga() {
      yield put({ type: 'TEST_ACTION' });
      throw error;
    }

    const wrapped = keepAlive(testSaga, {
      onEachError,
      onFail,
    });

    onEachError.mockReturnValue(false);
    sagaTester.start(wrapped);
    sagaTester.reset();
    expect(sagaTester.numCalled('TEST_ACTION')).toBe(3);
    expect(onEachError).toHaveBeenCalledTimes(3);
    expect(onEachError.mock.calls[0][0]).toBeInstanceOf(Function);
    expect(onEachError.mock.calls[0][1]).toEqual(error);
    expect(onEachError.mock.calls[0][2]).toEqual('testSaga');
    expect(onEachError.mock.calls[0][3]).toEqual(0);
    expect(onEachError.mock.calls[1][3]).toEqual(1);
    expect(onEachError.mock.calls[2][3]).toEqual(2);
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledWith(error, 'testSaga', 3);
  });

  it('allows to yield put on fail', () => {
    const onEachError = jest.fn();
    const sagaTester = new SagaTester({
      initialState: {},
      reducers: {
        test: (state = {}) => state,
      },
    });
    const error = new Error('Saga failed on purpose');

    function* testSaga() {
      yield put({ type: 'TEST_ACTION' });
      throw error;
    }

    function* onFail() {
      yield put({
        type: 'FATAL_ERROR',
      });
    }

    const wrapped = keepAlive(testSaga, {
      onEachError,
      onFail,
    });

    onEachError.mockReturnValue(false);
    sagaTester.start(wrapped);
    sagaTester.reset();
    expect(sagaTester.numCalled('FATAL_ERROR')).toBe(1);
  });
});
