import { RunStatus, statusForName } from './run-status.enum';

describe('statusForName', function () {
  it('should return a RunStatus enum representation for string', () => {
    expect(statusForName('RUNNING')).toBe(RunStatus.RUNNING);
  });
});

describe('statusForName-except', function () {
  it('should return an Exception for non-existing RunStatus enum representation for string', () => {
    expect(() => statusForName('NOT_EXISTING_ENUM_VALUE')).toThrow(Error);
  });
});
