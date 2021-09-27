enum RunStatus {
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  SCHEDULED = 'SCHEDULED',
  FAILED = 'FAILED',
  KILLED = 'KILLED',
  // additional status
  UNKNOWN = 'UNKNOWN',
  CANCELLING = 'CANCELLING',
}

export const statusForName = (name) => {
  switch (name) {
    case RunStatus.RUNNING:
      return RunStatus.RUNNING;
    case RunStatus.FINISHED:
      return RunStatus.FINISHED;
    case RunStatus.SCHEDULED:
      return RunStatus.SCHEDULED;
    case RunStatus.FAILED:
      return RunStatus.FAILED;
    case RunStatus.KILLED:
      return RunStatus.KILLED;
    case RunStatus.UNKNOWN:
      return RunStatus.UNKNOWN;
    case RunStatus.CANCELLING:
      return RunStatus.CANCELLING;
    default:
      throw new Error('No RunStatus for name ' + name);
  }
};

export { RunStatus };
