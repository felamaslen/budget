import sinon from 'sinon';

type MockTime = { setup: () => void; teardown: () => void; clock: sinon.SinonFakeTimers };

export function mockTime(time: Date = new Date()): MockTime {
  const mockedTime: MockTime = {
    clock: {} as sinon.SinonFakeTimers,
    setup: (): void => {
      mockedTime.clock = sinon.useFakeTimers(time);
    },
    teardown: (): void => {
      mockedTime.clock.restore();
    },
  };
  return mockedTime;
}

export function mockTimeOnly(time?: Date): ReturnType<typeof mockTime> {
  const mockedTime = mockTime(time);
  beforeEach(mockedTime.setup);
  afterEach(mockedTime.teardown);
  return mockedTime;
}
