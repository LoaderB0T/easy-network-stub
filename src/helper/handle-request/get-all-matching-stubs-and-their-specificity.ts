import { Stub } from '../../models/stub.js';
import { StubSpecificity } from '../../models/stub-specificity.js';

export const getAllMatchingStubsAndTheirSpecificity = (
  stubs: Stub<any, any>[],
  urlWithoutQueryParams: string,
  url: string,
  reasonsForNotMatching: string[]
) => {
  return stubs
    .map(stub => {
      if (!urlWithoutQueryParams.match(stub.regx)) {
        return false;
      }
      let specificity = 0;
      const matches = stub.queryParams.every(queryParam => {
        if (url.match(queryParam.regex)) {
          specificity++;
          return true;
        } else if (queryParam.optional) {
          if (url.match(queryParam.invalidRegex)) {
            reasonsForNotMatching.push(
              `\nStub [${stub.friendlyName}]: Optional Query Param ${queryParam.name}' was found, but it did not match the configured type.`
            );
            return false;
          }
          specificity--;
          return true;
        } else {
          reasonsForNotMatching.push(
            `\nStub [${stub.friendlyName}] The non-optional query parameter '${queryParam.name}' was not found in the url.`
          );
          return false;
        }
      });
      if (matches) {
        return { stub, specificity };
      } else {
        return false;
      }
    })
    .filter(x => x !== false)
    .map(x => x as StubSpecificity);
};
