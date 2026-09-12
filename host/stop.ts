/** Trips once per turn — reset before the next send. */
export type StopGate = {
  readonly requested: boolean;
  readonly when: Promise<void>;
  trip(): void;
  reset(): void;
};

export function createStopGate(): StopGate {
  let requested = false;
  let release = () => {};
  let when = new Promise<void>((resolve) => {
    release = resolve;
  });

  return {
    get requested() { return requested; },
    get when() { return when; },
    trip() {
      if (requested) return;
      requested = true;
      release();
    },
    reset() {
      requested = false;
      when = new Promise<void>((resolve) => {
        release = resolve;
      });
    },
  };
}
