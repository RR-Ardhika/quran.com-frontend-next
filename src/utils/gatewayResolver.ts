// FORK: resolve which gateway base URL to use when a NEXT_PUBLIC_*_BASE_URL env
// var holds a comma-separated list of candidates (e.g. a localhost URL for the
// dev machine and a LAN-IP URL for tablets/phones on the same network).
//
// The first reachable candidate wins. Reachability is probed in the background
// via GET <base>/healthz (short timeout); the winner is cached in memory and
// localStorage so repeat visits are instant. Server-side rendering always uses
// the first candidate (localhost works on the dev machine).

const STORAGE_KEY = 'quran:gatewayBase';
const PROBE_TIMEOUT_MS = 1500;

let resolved: string | null = null;
let probing = false;

const parseCandidates = (value?: string): string[] =>
  (value || '')
    .split(',')
    .map((entry) => entry.trim().replace(/\/+$/, ''))
    .filter(Boolean);

const probe = (base: string): Promise<boolean> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  return fetch(`${base}/healthz`, { signal: controller.signal, cache: 'no-store' })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => clearTimeout(timer));
};

const probeAll = async (candidates: string[]): Promise<void> => {
  if (probing) return;
  probing = true;
  // Sequential: earlier candidates are preferred.
  // eslint-disable-next-line no-restricted-syntax
  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await probe(candidate)) {
      resolved = candidate;
      try {
        window.localStorage.setItem(STORAGE_KEY, candidate);
      } catch {
        // storage unavailable (private mode etc.) — memory cache still applies
      }
      break;
    }
  }
  probing = false;
};

/**
 * Synchronous resolver: returns the best-known base for a comma-separated env
 * value — the cached winner if known, otherwise the first candidate — and kicks
 * off a background probe that upgrades the choice once a reachable gateway is
 * found. Returns `fallback` when no candidates are configured.
 *
 * @param {string} envValue raw env var value, possibly comma-separated
 * @param {string} fallback value to return when envValue is empty
 * @returns {string} the base URL to use
 */
// eslint-disable-next-line import/prefer-default-export
export const resolveGatewayBase = (envValue?: string, fallback = ''): string => {
  const candidates = parseCandidates(envValue);
  if (candidates.length === 0) return fallback;
  if (typeof window === 'undefined') return candidates[0]; // SSR
  if (resolved) return resolved;

  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }
  resolved = stored && candidates.includes(stored) ? stored : candidates[0];
  probeAll(candidates);
  return resolved;
};
