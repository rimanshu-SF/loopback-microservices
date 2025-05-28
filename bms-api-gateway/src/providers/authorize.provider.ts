import {Provider, inject} from '@loopback/core';
import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer,
} from '@loopback/authorization';
import { AuthorizationBindings } from 'loopback4-authorization';

export class MyAuthorizationProvider implements Provider<Authorizer> {
  constructor(
    @inject(AuthorizationBindings.CONFIG, {optional: true}) 
    private config?: { allowAlwaysPaths?: string[] }
  ) {}

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ): Promise<AuthorizationDecision> {
    const requestPath = authorizationCtx.resource;

    if (this.config?.allowAlwaysPaths?.includes(requestPath)) {
      return AuthorizationDecision.ALLOW;
    }

    const userRoles: string[] = authorizationCtx.principals[0]?.roles || [];

    if (!metadata.allowedRoles) {
      return AuthorizationDecision.ALLOW;
    }

    const hasAccess = userRoles.some((role: string) => metadata.allowedRoles!.includes(role));
    return hasAccess ? AuthorizationDecision.ALLOW : AuthorizationDecision.DENY;
  }
}
