import { headers, preflightHeaders } from './consts/headers';
import { buildStubRegex } from './helper/add-stub/build-stub-regex';
import { tryGetResponseForRequest } from './helper/handle-request/try-get-response-for-request';
import { Config } from './models/config';
import { HttpMethod } from './models/http-method';
import { InitConfig } from './models/init-config';
import { ParamMatcher, ParamType, ParamPrefix } from './models/parameter-type';
import { QueryParam } from './models/query-param';
import { RouteParam } from './models/route-param';
import { RouteResponseCallback } from './models/route-response-callback';

export class EasyNetworkStub {
  private readonly _urlMatch: string | RegExp;
  private config: Config = {
    stubs: [],
    errorLogger: error => {
      console.error(error.message);
      console.groupCollapsed('Mocking info');
      console.groupCollapsed('Request');
      console.log(error.request);
      console.groupEnd();
      console.groupCollapsed('Mocks');
      console.log(error.registeredStubs);
      console.groupEnd();
      console.groupEnd();
    },
    failer: (error: string | Error) => {
      throw error;
    },
    parameterTypes: []
  };

  /**
   * A class to intercept and stub all calls to a certain api path.
   * @param urlMatch The match for all request urls that should be intercepted.
   * All non-stubbed calls that match this interceptor will throw an error
   */
  constructor(urlMatch: string | RegExp) {
    this._urlMatch = urlMatch;
    this.addDefaultParamTypes();
  }

  private addDefaultParamTypes() {
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
    this.config.failer = config.failer;
    this.config.errorLogger = config.errorLogger ?? this.config.errorLogger;

    return config.interceptor(this._urlMatch, async req => {
      if (req.method.toUpperCase() === 'OPTIONS') {
        req.reply({ statusCode: 200, headers: preflightHeaders });
        return;
      }

      let response = await tryGetResponseForRequest(req, this.config);
      if (!response) {
        return;
      }

      if (typeof response !== 'object') {
        // Because strings or other primitive types also get parsed with JSON.parse, we need to strigify them here first
        response = JSON.stringify(response);
      }
      req.reply({ statusCode: 200, body: response, headers });

      return response;
    });
  }

  /**
   * Add a new parameter type that can be used in the stub method route property.
   * @param name The name of the new parameter (To use it as {name} later in the route property)
   * @param matcher The regex matching group that matches the parameter. Eg: "([a-z]\d+)"
   * @param parser The optional function that parses the string found by the matcher into any type you want.
   */
  public addParameterType(name: string, matcher: ParamMatcher, type: ParamType, parser: (v: string) => any = s => s) {
    this.config.parameterTypes.push({ name, matcher, parser, type });
  }

  /**
   * Add a single api stub to your intercepted routes.
   * @param method The http method that should be stubbed
   * @param route The route that should be stubbed. Supports parameters in the form of {name:type}.
   * @param response The callback in which you can process the request and reply with the stub. When a Promise is returned, the stub response will be delayed until it is resolved.
   */
  public stub<Route extends string>(method: HttpMethod, route: Route, response: RouteResponseCallback<Route>): void {
    const segments = route.split(/(?=[\/?&])(?![^{]*})/);
    const params: RouteParam[] = [];
    const queryParams: QueryParam[] = [];
    const rgxString = buildStubRegex(segments, params, queryParams, this.config);

    const regx = new RegExp(rgxString, 'i');

    this.config.stubs.push({
      regx,
      response,
      params,
      queryParams,
      method
    });
  }
}
