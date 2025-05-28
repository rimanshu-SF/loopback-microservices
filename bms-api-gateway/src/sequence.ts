import {
    FindRoute,
    HttpErrors,
    InvokeMethod,
    ParseParams,
    Reject,
    RequestContext,
    RestBindings,
    Send,
    SequenceHandler,
  } from '@loopback/rest';
  import { inject } from '@loopback/core';
import { CustomJWTService } from './services/jwt.service';
import { AuthorizationBindings, AuthorizeErrorKeys, AuthorizeFn, UserPermissionsFn } from 'loopback4-authorization';
import { AuthenticateFn, AuthenticationBindings } from 'loopback4-authentication';
  
  export class MySequence implements SequenceHandler {
    constructor(
      @inject(RestBindings.SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
      @inject(RestBindings.SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
      @inject(RestBindings.SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
      @inject(RestBindings.SequenceActions.SEND) public send: Send,
      @inject(RestBindings.SequenceActions.REJECT) public reject: Reject,
      @inject(AuthorizationBindings.AUTHORIZE_ACTION)
    protected checkAuthorisation: AuthorizeFn,
    @inject(AuthorizationBindings.USER_PERMISSIONS)
    private readonly getUserPermissions: UserPermissionsFn<string>,
      @inject('services.JWTService') private jwtService: CustomJWTService,
    @inject(AuthenticationBindings.USER_AUTH_ACTION)
            protected authenticateRequest: AuthenticateFn<any>,
    ) {}
  
    async handle(context: RequestContext) {
      try {
        const { request, response } = context;
        const route = this.findRoute(request);
        // console.log("Route:", route);
        const authUser: any = await this.authenticateRequest(request);
        const isAccessAllowed: boolean = await this.checkAuthorisation(
            authUser?.permissions || [],
            request,
        );
        if (!isAccessAllowed) {
            throw new HttpErrors.Forbidden(AuthorizeErrorKeys.NotAllowedAccess);
        }
        (request as any).user = authUser;
        const args = await this.parseParams(request, route);
        request.body = args[args.length - 1];
  
        const result = await this.invoke(route, args);
        this.send(response, result);
      } catch (err) {
        this.reject(context, err);
      }
    }
  }
  