import { eventChannel } from 'redux-saga';
import { fork, take, call, put } from 'redux-saga/effects';
import debounce from 'debounce';
import { windowResized } from '~client/actions/app';

export function windowResizeEventChannel() {
    return eventChannel(emit => {
        const resizeHandler = debounce(() => emit(windowResized(window.innerWidth)), 50, true);

        window.addEventListener('resize', resizeHandler);

        return () => window.removeEventListener('resize', resizeHandler);
    });
}

export function *watchEventEmitter(channelCreator) {
    const channel = yield call(channelCreator);

    while (true) {
        const action = yield take(channel);

        yield put(action);
    }
}

export default function *appSaga() {
    yield fork(watchEventEmitter, windowResizeEventChannel);
}
