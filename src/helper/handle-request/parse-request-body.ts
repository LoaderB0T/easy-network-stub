import { Request } from '../../models/request';

export const parseRequestBody = (req: Request) => {
  try {
    const parsedBody = JSON.parse(req.body);
    return parsedBody;
  } catch {
    // Ignore and move on
  }
  if (req.body === 'true') {
    return true;
  } else if (req.body === 'false') {
    return false;
  } else if (/^\d+$/.test(req.body)) {
    return Number.parseInt(req.body, 10);
  } else if (/^\d*.\d*$/.test(req.body)) {
    return Number.parseFloat(req.body);
  } else {
    return req.body;
  }
};
