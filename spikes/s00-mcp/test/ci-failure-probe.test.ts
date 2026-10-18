import assert from 'node:assert/strict';
import { test } from 'node:test';

// Temporary CI acceptance probe. Remove after observing the hosted failure.
test('intentional CI failure probe', () => {
  assert.fail('Intentional failure to verify that s00-offline blocks on a failing test');
});
