/** A single reason an instrument cannot be represented as JSON, and where in the instrument it occurs. */
type SerializationViolation = {
  /** A path into the instrument, e.g. `content.medicalHistory.fieldset.yearDiagnosed` */
  path: string;
  /** Why the value at `path` cannot be serialized, phrased for the person who wrote the instrument */
  reason: string;
};

function formatViolations(violations: readonly SerializationViolation[]) {
  const width = Math.max(...violations.map(({ path }) => path.length));
  return violations.map(({ path, reason }) => `  ${path.padEnd(width)}  ${reason}`).join('\n');
}

/**
 * Thrown when an instrument contains anything JSON cannot hold. Carries every violation found in a
 * single pass rather than the first, so an author learns everything blocking the export at once.
 */
class InstrumentSerializationError extends Error {
  readonly violations: readonly SerializationViolation[];

  constructor(instrumentName: string, violations: readonly SerializationViolation[]) {
    super(`Cannot serialize instrument '${instrumentName}':\n${formatViolations(violations)}`);
    this.name = 'InstrumentSerializationError';
    this.violations = violations;
  }
}

export { InstrumentSerializationError };
export type { SerializationViolation };
