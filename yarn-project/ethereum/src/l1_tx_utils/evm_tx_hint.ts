import { trace } from '@opentelemetry/api';
import type { Hex } from 'viem';

/** Adds an EVM transaction hint to the active span for Mirador to resolve. */
export function addEvmTxHint(txHash: Hex, chainId: number): void {
  trace.getActiveSpan()?.addEvent('mirador.web3.evm.txhint', {
    'tx.hash': txHash,
    'chain.id': chainId,
  });
}
