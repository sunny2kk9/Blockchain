"use client";

import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { wagmiConfig } from '../../blockchain/config';
import abiJson from '../../blockchain/abi.json';
import { CONTRACT_ADDRESS } from '../../blockchain/address';

export default function HomeClient() {
  const [word, setWord] = useState('');
  const [currentValue, setCurrentValue] = useState<string | null>(null);
  const [loadingRead, setLoadingRead] = useState(false);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Read the contract value using the imported readContract function
  async function fetchValue() {
    try {
      setLoadingRead(true);
      const res = await readContract(wagmiConfig as any, {
        address: CONTRACT_ADDRESS as any,
        abi: abiJson.abi as any,
        functionName: 'get',
      } as any);
      setCurrentValue(String(res ?? ''));
    } catch (err) {
      console.error('readContract error', err);
      setCurrentValue(null);
    } finally {
      setLoadingRead(false);
    }
  }

  useEffect(() => {
    fetchValue();
    // optionally, you could poll or subscribe here
  }, []);

  async function send() {
    if (!word) return;
    try {
      setSending(true);
      const tx = await writeContract(wagmiConfig as any, {
        abi: abiJson.abi as any,
        address: CONTRACT_ADDRESS as any,
        functionName: 'set',
        args: [word],
      } as any);

      const hash = (tx as any)?.hash ?? String(tx);
      setTxHash(hash);

      try {
  await waitForTransactionReceipt(wagmiConfig as any, { hash } as any);
      } catch (waitErr) {
        // ignore wait errors but log
        console.warn('waitForTransactionReceipt error', waitErr);
      }

      await fetchValue();
    } catch (err) {
      console.error('writeContract error', err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-600 via-indigo-600 to-purple-700 font-sans dark:bg-linear-to-br dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <main className="w-full max-w-3xl p-12 bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Blockchain Wallet</h2>
          <ConnectButton />
        </div>

        <section className="mb-8 p-6 bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
          <h3 className="font-semibold text-lg text-purple-900 dark:text-purple-200 mb-3">Read value from contract</h3>
          <p className="mt-2 text-base font-medium text-gray-700 dark:text-gray-300">
            Current value: <span className="text-purple-600 dark:text-purple-400 font-bold">{loadingRead ? 'Loading…' : currentValue ?? '—'}</span>
          </p>
        </section>

        <section className="p-6 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
          <h3 className="font-semibold text-lg text-indigo-900 dark:text-indigo-200 mb-3">Set value on contract</h3>
          <div className="mt-2 flex gap-3">
            <input
              className="border-2 border-purple-300 dark:border-purple-600 p-3 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white transition-all"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter new value"
            />
            <button
              className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => send()}
              disabled={sending || !word}
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
          {txHash && (
            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-300 dark:border-green-700">✓ Transaction: <span className="font-mono text-xs break-all">{txHash}</span></p>
          )}
        </section>
      </main>
    </div>
  );
}
