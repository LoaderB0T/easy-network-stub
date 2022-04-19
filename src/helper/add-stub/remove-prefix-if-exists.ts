import { ParamPrefix } from '../../models/parameter-type.js';

export const removePrefixIfExists = (segment: string): { prefix: ParamPrefix; segment: string } => {
  let prefix = segment.charAt(0);

  if (prefix === '/' || prefix === '&' || prefix === '?') {
    segment = segment.substring(1);
    if (prefix === '?') {
      prefix = `\\?`;
    }
  } else {
    prefix = '';
  }
  return { prefix: prefix as ParamPrefix, segment };
};
