import { setupWorker } from 'msw/browser';

import { authHandlers } from './handlers/auth.handlers';
import { instrumentHandlers } from './handlers/instrument.handlers';
import { instrumentRecordHandlers } from './handlers/instrument-record.handlers';
import { sessionHandlers } from './handlers/session.handlers';
import { setupHandlers } from './handlers/setup.handlers';
import { subjectHandlers } from './handlers/subject.handlers';
import { summaryHandlers } from './handlers/summary.handlers';

export const worker = setupWorker(
  ...authHandlers,
  ...instrumentRecordHandlers,
  ...instrumentHandlers,
  ...sessionHandlers,
  ...setupHandlers,
  ...subjectHandlers,
  ...summaryHandlers
);
