// Runs saves one after another per key, in the order they were queued, so
// rapid taps on the same thing can't land out of order. Tasks must not
// reject; handle errors inside them.
export function createSaveQueue() {
  const tails = new Map<string, Promise<void>>();
  // A task that runs on its own (Clear): it waits for every queued save,
  // and every save queued after it waits for it
  let barrier: Promise<void> = Promise.resolve();

  return {
    run(key: string, task: () => Promise<void>): Promise<void> {
      const next = (tails.get(key) ?? barrier).then(task);
      tails.set(key, next);
      return next;
    },

    runAlone(task: () => Promise<void>): Promise<void> {
      barrier = Promise.all([barrier, ...tails.values()]).then(task);
      tails.clear();
      return barrier;
    },

    // Settles once everything queued so far has run
    idle(): Promise<void> {
      return Promise.all([barrier, ...tails.values()]).then(() => {});
    },
  };
}
