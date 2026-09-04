import { jest } from '@jest/globals';
import { ROOT_CONTEXT, type Span, type Tracer, trace } from '@opentelemetry/api';
import { mock } from 'jest-mock-extended';

import { recordEvmTxHint } from './evm_tx_hint.js';

describe('recordEvmTxHint', () => {
  const txHash = '0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds a Mirador transaction hint to the active span', () => {
    const span = mock<Span>();
    span.isRecording.mockReturnValue(true);
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span);

    recordEvmTxHint({ txHash, chainId: 8453 });

    expect(span.addEvent).toHaveBeenCalledWith('mirador.web3.evm.txhint', {
      'tx.hash': txHash,
      'chain.id': 8453,
    });
    expect(span.end).not.toHaveBeenCalled();
  });

  it('creates a root hint span when there is no active span', () => {
    const span = mock<Span>();
    const tracer = mock<Tracer>();
    tracer.startActiveSpan.mockImplementation((...args: unknown[]) => {
      const callback = args.at(-1);
      if (typeof callback !== 'function') {
        throw new Error('Expected a span callback');
      }
      return callback(span);
    });
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(undefined);
    jest.spyOn(trace, 'getTracer').mockReturnValue(tracer);

    recordEvmTxHint({ txHash, chainId: 8453 });

    expect(tracer.startActiveSpan).toHaveBeenCalledWith('EvmTxHint', {}, ROOT_CONTEXT, expect.any(Function));
    expect(span.addEvent).toHaveBeenCalledWith('mirador.web3.evm.txhint', {
      'tx.hash': txHash,
      'chain.id': 8453,
    });
    expect(span.end).toHaveBeenCalledTimes(1);
  });

  it('creates a root hint span when the active span is not recording', () => {
    const activeSpan = mock<Span>();
    const hintSpan = mock<Span>();
    const tracer = mock<Tracer>();
    tracer.startActiveSpan.mockImplementation((...args: unknown[]) => {
      const callback = args.at(-1);
      if (typeof callback !== 'function') {
        throw new Error('Expected a span callback');
      }
      return callback(hintSpan);
    });
    activeSpan.isRecording.mockReturnValue(false);
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(activeSpan);
    jest.spyOn(trace, 'getTracer').mockReturnValue(tracer);

    recordEvmTxHint({ txHash, chainId: 8453 });

    expect(activeSpan.addEvent).not.toHaveBeenCalled();
    expect(hintSpan.addEvent).toHaveBeenCalledWith('mirador.web3.evm.txhint', {
      'tx.hash': txHash,
      'chain.id': 8453,
    });
    expect(hintSpan.end).toHaveBeenCalledTimes(1);
  });

  it('is safe with the default no-op tracer provider', () => {
    expect(() => recordEvmTxHint({ txHash, chainId: 8453 })).not.toThrow();
  });
});
