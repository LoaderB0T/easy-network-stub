import { headers, preflightHeaders } from './consts/headers.js';
import { buildStubRegex } from './helper/add-stub/build-stub-regex.js';
import { tryGetResponseForRequest } from './helper/handle-request/try-get-response-for-request.js';
import { Config } from './models/config.js';
import { CustomResponseHandler } from './models/custom-response-handler.js';
import { HttpMethod } from './models/http-method.js';
import { InitConfig } from './models/init-config.js';
import { ParamMatcher, ParamType } from './models/parameter-type.js';
import { QueryParam } from './models/query-param.js';
import { RouteParam } from './models/route-param.js';
import { RouteResponseCallback } from './models/route-response-callback.js';
import { StubHandle } from './models/stub-handle.js';
import { Stub } from './models/stub.js';

export class EasyNetworkStub {
  private readonly _urlMatch: string | RegExp;
  private readonly _config: Config = {
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
    parameterTypes: [],
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
    this.addParameterType('string', '([\\w-_~.]+)', 'route');
    this.addParameterType('number', '(\\d+)', 'route', a => Number.parseInt(a, 10));
    this.addParameterType('boolean', '(true|false)', 'route', a => a === 'true');

    this.addParameterType('string', '([\\w%~!*().\\-_]+)', 'query');
    this.addParameterType('number', '(\\d+)', 'query', a => Number.parseInt(a, 10));
    this.addParameterType('boolean', '(true|false)', 'query', a => a === 'true');
  }

  /**
   * Call this in your beforeEach hook to start using the stub.
   */
  protected initInternal<T>(config: InitConfig<T>): T {
    this._config.failer = config.failer;
    this._config.errorLogger = config.errorLogger ?? this._config.errorLogger;

    return config.interceptor(this._urlMatch, async req => {
      if (req.method.toUpperCase() === 'OPTIONS') {
        req.reply({ statusCode: 200, headers: preflightHeaders });
        return;
      }

      const responseResult = await tryGetResponseForRequest(req, this._config);

      if (responseResult.closed) {
        return;
      }

      const response = config.responseProcessor
        ? config.responseProcessor(responseResult.response)
        : responseResult.response;

      if (response instanceof CustomResponseHandler) {
        await response.handle(req);
        return;
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
  public addParameterType(
    name: string,
    matcher: ParamMatcher,
    type: ParamType,
    parser: (v: string) => any = s => s
  ) {
    this._config.parameterTypes.splice(0, 0, { name, matcher, parser, type });
  }

  /**
   * Add a single api stub to your intercepted routes.
   * @param method The http method that should be stubbed
   * @param route The route that should be stubbed. Supports parameters in the form of {name:type}.
   * @param response The callback in which you can process the request and reply with the stub. When a Promise is returned, the stub response will be delayed until it is resolved.
   */
  public stub<Route extends string>(
    method: HttpMethod,
    route: Route,
    response: RouteResponseCallback<Route, any>
  ): StubHandle {
    return this.stub2<any>()(method, route, response);
  }

  /**
   * The stub2 method provides a way to set the type of the body that is sent.
   * Due to restrictions in TypeScript (https://github.com/microsoft/TypeScript/issues/10571, https://github.com/Microsoft/TypeScript/pull/26349),
   * We have to hacke a bit here. Calling stub2<T>() will return the stub method with a body of type T.
   *
   * Usage:
   * ```
   * .stub2<MyRequest>()('GET', '/api/test', ({ body }) => {
   *   // body is of type MyRequest
   * });
   * ```
   * @returns The stub method with a body of type T.
   */
  public stub2<T>() {
    return <Route extends string>(
      method: HttpMethod,
      route: Route,
      response: RouteResponseCallback<Route, T>
    ): StubHandle => {
      const segments = route.split(/(?=[/?&])(?![^{]*})/).filter(x => x !== '/');
      const params: RouteParam[] = [];
      const queryParams: QueryParam[] = [];
      const rgxString = buildStubRegex(segments, params, queryParams, this._config);

      const regx = new RegExp(rgxString, 'i');

      const newStub: Stub<any, any> = {
        regx,
        response,
        params,
        queryParams,
        method,
        friendlyName: route,
      };

      this._config.stubs.push(newStub);

      return {
        unregister: () => {
          const index = this._config.stubs.indexOf(newStub);
          if (index !== -1) {
            this._config.stubs.splice(index, 1);
          }
        },
      };
    };
  }

  public unregisterAll() {
    this._config.stubs = [];
  }
}
