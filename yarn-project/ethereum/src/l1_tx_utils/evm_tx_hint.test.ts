import { jest } from '@jest/globals';
import { type Span, trace } from '@opentelemetry/api';
import { mock } from 'jest-mock-extended';

import { addEvmTxHint } from './evm_tx_hint.js';

describe('addEvmTxHint', () => {
  const txHash = '0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds a Mirador transaction hint to the active span', () => {
    const span = mock<Span>();
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span);

    addEvmTxHint(txHash, 8453);

    expect(span.addEvent).toHaveBeenCalledWith('mirador.web3.evm.txhint', {
      'tx.hash': txHash,
      'chain.id': 8453,
    });
  });

  it('does nothing when there is no active span', () => {
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(undefined);

    expect(() => addEvmTxHint(txHash, 8453)).not.toThrow();
  });
});
