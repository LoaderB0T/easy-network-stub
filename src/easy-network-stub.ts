import { headers, preflightHeaders } from './consts/headers';
import { ErrorLog } from './models/error-log';
import { ErrorResponse } from './models/error-response';
import { HttpMethod } from './models/http-method';
import { InitConfig } from './models/init-config';
import { ParameterType, ParamMatcher, ParamType, ParamPrefix } from './models/parameter-type';
import { Request } from './models/request';
import { RouteParam } from './models/route-param';
import { RouteParams } from './models/route-params';
import { RouteResponseCallback } from './models/route-response-callback';
import { Stub } from './models/stub';

export class EasyNetworkStub {
  private readonly _stubs: Stub<any>[] = [];
  private readonly _urlMatch: string | RegExp;
  private readonly _parameterTypes: ParameterType[] = [];
  private _errorLogger: (error: ErrorLog) => void;
  private _failer: (error: string | Error) => void;

  /**
   * A class to intercept and stub all calls to a certain api path.
   * @param urlMatch The match for all request urls that should be intercepted.
   * All non-stubbed calls that match this interceptor will throw an error
   */
  constructor(urlMatch: string | RegExp) {
    this._urlMatch = urlMatch;

    this.addParameterType('string', '(\\w+)', 'route');
    this.addParameterType('number', '(\\d+)', 'route', a => Number.parseInt(a, 10));
    this.addParameterType('boolean', '(true|false)', 'route', a => a === 'true');

    this.addParameterType('string', '([\\w%]+)', 'query');
    this.addParameterType('number', '(\\d+)', 'query', a => Number.parseInt(a, 10));
    this.addParameterType('boolean', '(true|false)', 'query', a => a === 'true');
  }

  /**
   * Call this in your beforeEach hook to start using the stub.
   */
  protected initInternal<T>(config: InitConfig<T>): T {
    this._failer = config.failer;
    this._errorLogger =
      config.errorLogger ??
      (error => {
        console.error(error.message);
        console.groupCollapsed('Mocking info');
        console.groupCollapsed('Request');
        console.log(error.request);
        console.groupEnd();
        console.groupCollapsed('Mocks');
        console.log(error.registeredStubs);
        console.groupEnd();
        console.groupEnd();
      });

    return config.interceptor(this._urlMatch, async req => {
      req.url = req.url.toLowerCase();

      if (req.method.toUpperCase() === 'OPTIONS') {
        req.reply({ statusCode: 200, headers: preflightHeaders });
        return;
      }

      const stub = this._stubs.find(x => req.url.match(x.regx) && x.method === req.method);

      if (!stub) {
        this._errorLogger({
          message: `Route not mocked: [${req.method}] ${req.url}`,
          method: req.method,
          request: req,
          registeredStubs: this._stubs,
          url: req.url,
          stack: new Error().stack
        });
        req.destroy();
        this._failer(`Route not mocked: [${req.method}] ${req.url}`);
        return;
      }

      const res = req.url.match(stub.regx);

      if (!res) {
        throw new Error('The provided matcher did not match the current request');
      }

      const paramMap = this.parseRequestParameters(stub, res);
      const parsedBody = this.parseRequestBody(req);

      let response: any;
      try {
        response = await stub.response({ body: parsedBody, params: paramMap });
      } catch (e: any) {
        return this.logErrorAndReplyWithErrorCode(stub, req, e);
      }

      if (typeof response !== 'object') {
        // Because strings or other primitive types also get parsed with JSON.parse, we need to strigify them here first
        response = JSON.stringify(response);
      }
      req.reply({ statusCode: 200, body: response, headers });

      return response;
    });
  }

  private logErrorAndReplyWithErrorCode(stub: Stub<any>, req: Request, e: any) {
    const error = e as ErrorResponse<any>;
    const errorContent = typeof error.content !== 'object' ? JSON.stringify(error) : error.content;
    let errorHeaders = { ...headers };
    if (error.headers) {
      errorHeaders = { ...errorHeaders, ...error.headers };
    }
    if (error.statusCode) {
      // If the error has a status code, we assume that the erro is purposely thrown in the test code
      req.reply({ statusCode: error.statusCode, body: errorContent, headers: errorHeaders });
    } else {
      // If the error does not have a status code, we assume that the error is caused by a bug in the test code
      this._errorLogger({
        message:
          `Error while trying to get the response from the stub: [${stub.method}] (${stub.regx.source}) for '${req.url}'\n` +
          `msg: ${e.message}\n` +
          'This is most likely a bug in your stub. (No statusCode was provided)',
        method: req.method,
        request: req,
        registeredStubs: this._stubs,
        url: req.url,
        stack: e.stack ?? new Error().stack
      });
      req.reply({ statusCode: 500, body: JSON.stringify(errorContent ?? 'unknown error in mocked response') });
    }
  }

  private parseRequestParameters(stub: Stub<any>, res: RegExpMatchArray) {
    const paramMap: RouteParams = {};
    for (let i = 0; i < stub.params.length; i++) {
      const param = stub.params[i];
      let paramValue: any;

      const knownParameter = this._parameterTypes.find(x => x.name === param.type);
      if (knownParameter) {
        paramValue = knownParameter.parser(res[i + 1]);
      } else {
        paramValue = res[i + 1];
      }

      paramMap[stub.params[i].name] = paramValue;
    }
    return paramMap;
  }

  private parseRequestBody(req: Request) {
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
  }

  /**
   * Add a new parameter type that can be used in the stub method route property.
   * @param name The name of the new parameter (To use it as {name} later in the route property)
   * @param matcher The regex matching group that matches the parameter. Eg: "([a-z]\d+)"
   * @param parser The optional function that parses the string found by the matcher into any type you want.
   */
  public addParameterType(name: string, matcher: ParamMatcher, type: ParamType, parser: (v: string) => any = s => s) {
    this._parameterTypes.push({ name, matcher, parser, type });
  }

  /**
   * Add a single api stub to your intercepted routes.
   * @param method The http method that should be stubbed
   * @param route The route that should be stubbed. Supports parameters in the form of {name:type}.
   * @param response The callback in which you can process the request and reply with the stub. When a Promise is returned, the stub response will be delayed until it is resolved.
   */
  public stub<Route extends string>(method: HttpMethod, route: Route, response: RouteResponseCallback<Route>): void {
    const segments = route.split(/(?=[\/?&])/);
    const params: RouteParam[] = [];
    const rgxString = this.buildStubRegex(segments, params);

    const regx = new RegExp(rgxString, 'i');

    this._stubs.push({
      regx,
      response,
      params,
      method
    });
  }

  private buildStubRegex(segments: string[], params: RouteParam[]) {
    return (
      segments
        .map(segment => {
          return this.buildStubRegexForSegment(segment, params);
        })
        .join('') + '/?$'
    );
  }

  private buildStubRegexForSegment(rawSegment: string, params: RouteParam[]) {
    const { prefix, segment } = this.removePrefixIfExists(rawSegment);
    const paramType: ParamType = prefix === '/' || prefix === '' ? 'route' : 'query';

    const paramMatch = segment.match(/{(\w+)([:]\w+)?}/);
    if (paramMatch) {
      const paramName = paramMatch[1];
      if (paramName) {
        const paramValueType = paramMatch[2]?.substring(1) ?? 'string';
        params.push({ name: paramName, type: paramValueType });
        const knownParameter = this._parameterTypes.find(x => x.name === paramValueType && x.type === paramType);
        if (knownParameter) {
          return prefix + (paramType === 'route' ? knownParameter.matcher : `${paramName}(?:=(?:${knownParameter.matcher})?)?`);
        }
      }
      return prefix + (paramType === 'route' ? '(\\w+)' : '\\w+=(\\w+)');
    } else {
      return prefix + segment;
    }
  }

  private removePrefixIfExists(segment: string): { prefix: ParamPrefix; segment: string } {
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
  }
}
