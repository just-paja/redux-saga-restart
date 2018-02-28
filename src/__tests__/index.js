import SagaTester from 'redux-saga-tester';
import sinon from 'sinon';

import { put } from 'redux-saga/effects';

import keepAlive from '..';

describe('Keep alive', () => {
  beforeEach(() => {
    sinon.stub(console, 'warn');
  });

  afterEach(() => {
    // eslint-disable-next-line no-console
    console.warn.restore();
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
    const onEachError = sinon.stub().callsArgWith(0, '@@saga/FAIL');
    const onFail = sinon.spy();
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
    expect(onEachError.calledOnce).toBe(true);
    expect(onFail.calledOnce).toBe(true);
  });

  it('does not die on saga fail given onEachError is not function', () => {
    const onError = sinon.spy();
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
    expect(onError.args).toEqual([]);
    expect(onError.called).toBeFalsy();
  });

  it('does not die on saga fail given onEachError is not function', () => {
    const onError = sinon.spy();
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
    expect(onError.args).toEqual([]);
    expect(onError.called).toBeFalsy();
  });

  it('triggers console warning on saga fail given onEachError is not function', () => {
    const onError = sinon.spy();
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
    expect(console.warn.called).toBeTruthy();
  });

  it('triggers console warning on saga restart given warnings are enabled', () => {
    const onError = sinon.spy();
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
    expect(console.warn.called).toBeTruthy();
  });

  it('triggers console warning on saga restart given warnings are disabled', () => {
    const onError = sinon.spy();
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
    expect(console.warn.called).toBeTruthy();
  });

  it('does not trigger console warning on saga fail given onEachError is not function and warnings are disabled', () => {
    const onError = sinon.spy();
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
    expect(console.warn.called).toBeFalsy();
  });

  it('keeps alive saga until maximum number of attempts when not stopped', () => {
    const onEachError = sinon.stub();
    const onFail = sinon.spy();
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

    onEachError.returns(false);
    sagaTester.start(wrapped);
    sagaTester.reset();
    expect(sagaTester.numCalled('TEST_ACTION')).toBe(3);
    expect(onEachError.calledThrice).toBe(true);
    expect(onEachError.getCall(0).args[0]).toBeInstanceOf(Function);
    expect(onEachError.getCall(0).args[1]).toEqual(error);
    expect(onEachError.getCall(0).args[2]).toEqual('testSaga');
    expect(onEachError.getCall(0).args[3]).toEqual(0);
    expect(onEachError.getCall(1).args[3]).toEqual(1);
    expect(onEachError.getCall(2).args[3]).toEqual(2);
    expect(onFail.calledOnce).toBe(true);
    expect(onFail.args).toEqual([[
      error, 'testSaga', 3,
    ]]);
  });

  it('allows to yield put on fail', () => {
    const onEachError = sinon.stub();
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

    onEachError.returns(false);
    sagaTester.start(wrapped);
    sagaTester.reset();
    expect(sagaTester.numCalled('FATAL_ERROR')).toBe(1);
  });
});
