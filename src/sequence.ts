/*import {
  AuthenticateFn,
  AuthenticationBindings
} from '@loopback/authentication';
import {
  inject
} from '@loopback/core';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler
} from '@loopback/rest';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(AuthenticationBindings.AUTH_ACTION) protected authenticate: AuthenticateFn,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) { }

  async handle(context: RequestContext): Promise<void> {
    try {
      const {
        request,
        response
      } = context;

      // Step 1: Find the route
      const route = this.findRoute(request);

      // Step 2: Authenticate the request
      await this.authenticate(request);

      // Step 3: Parse the parameters
      const args = await this.parseParams(request, route);

      // Step 4: Invoke the controller method
      const result = await this.invoke(route, args);

      // Step 5: Send the response
      this.send(response, result);
    } catch (err) {
      // Handle the error and send a consistent response
      this.reject(context, err);
    }
  }
}
*/



import {MiddlewareSequence} from '@loopback/rest';

export class MySequence extends MiddlewareSequence { }
