import { resolveGatewayBase } from './gatewayResolver';

// FORK: rewrite known audio CDN URLs through a configurable base URL when
// NEXT_PUBLIC_AUDIO_BASE_URL is set. Defaults to the untouched upstream URL
// when unset, so stock behavior is preserved. Pattern: <base>/audio/<host>/<path>.

const AUDIO_CDN_HOSTS = ['audio.qurancdn.com', 'verses.quran.foundation', 'download.quranicaudio.com'];

/**
 * @param {string} url absolute audio URL on a known CDN host
 * @returns {string} the URL rewritten through NEXT_PUBLIC_AUDIO_BASE_URL, or the original URL
 */
// eslint-disable-next-line import/prefer-default-export
export const getProxiedAudioUrl = (url: string): string => {
  // Supports a comma-separated candidate list; the first reachable one wins (see gatewayResolver).
  const base = resolveGatewayBase(process.env.NEXT_PUBLIC_AUDIO_BASE_URL);
  if (!base) {
    return url;
  }
  for (let i = 0; i < AUDIO_CDN_HOSTS.length; i += 1) {
    const prefix = `https://${AUDIO_CDN_HOSTS[i]}/`;
    if (url.startsWith(prefix)) {
      return `${base}/audio/${AUDIO_CDN_HOSTS[i]}/${url.slice(prefix.length)}`;
    }
  }
  return url;
};
