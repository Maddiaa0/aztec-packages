import { EVM_TX_HINT_EVENT_NAME } from '@aztec/foundation/telemetry';

import { ROOT_CONTEXT, type Span, trace } from '@opentelemetry/api';
import type { Hex } from 'viem';

export type EvmTxHint = Readonly<{
  txHash: Hex;
  chainId: number;
}>;

/** Records an EVM transaction hint for Mirador, even when no recording span is active. */
export function recordEvmTxHint({ txHash, chainId }: EvmTxHint): void {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan?.isRecording()) {
    addEvmTxHintEvent(activeSpan, txHash, chainId);
    return;
  }

  trace.getTracer('@aztec/ethereum/l1-tx-utils').startActiveSpan('EvmTxHint', {}, ROOT_CONTEXT, span => {
    addEvmTxHintEvent(span, txHash, chainId);
    span.end();
  });
}

function addEvmTxHintEvent(span: Span, txHash: Hex, chainId: number): void {
  span.addEvent(EVM_TX_HINT_EVENT_NAME, {
    'tx.hash': txHash,
    'chain.id': chainId,
  });
}
