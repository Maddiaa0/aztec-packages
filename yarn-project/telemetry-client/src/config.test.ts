import { afterEach, describe, expect, it } from '@jest/globals';

import { getConfigEnvVars } from './config.js';

describe('telemetry config', () => {
  afterEach(() => {
    delete process.env.MIRADOR_API_KEY;
  });

  it('reads the Mirador API key without exposing it during serialization', () => {
    process.env.MIRADOR_API_KEY = 'mir_srv_test';

    const config = getConfigEnvVars();

    expect(config.miradorApiKey?.getValue()).toBe('mir_srv_test');
    expect(JSON.stringify(config)).not.toContain('mir_srv_test');
  });
});
