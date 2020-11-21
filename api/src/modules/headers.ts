import { Request } from 'express';

export const getHeader = (req: Partial<Pick<Request, 'headers'>>, key: string): string => {
  const keyLowerCase = key.toLowerCase();
  const headers = req.headers || {};
  const headerKey: string | undefined = Object.keys(headers).find(
    (item) => item.toLowerCase() === keyLowerCase,
  );

  if (!headerKey) {
    return '';
  }

  const header = headers[headerKey];

  if (Array.isArray(header)) {
    return header[0] || '';
  }

  return header || '';
};

export const getIp = (req: Partial<Pick<Request, 'headers' | 'connection'>>): string =>
  getHeader(req, 'x-real-ip') ||
  getHeader(req, 'x-forwarded-for') ||
  req.connection?.remoteAddress ||
  '';
