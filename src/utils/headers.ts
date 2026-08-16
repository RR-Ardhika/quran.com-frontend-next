import { NextApiRequest } from 'next';


export const X_AUTH_SIGNATURE = 'x-auth-signature';
export const X_TIMESTAMP = 'x-timestamp';
export const X_PROXY_SIGNATURE = 'x-proxy-signature';
export const X_PROXY_TIMESTAMP = 'x-proxy-timestamp';
export const X_INTERNAL_CLIENT = 'x-internal-client';

export const getAdditionalHeaders = (_req: NextApiRequest) => {
  // FORK: no signature headers needed when calling the public API directly
  return {};
};
