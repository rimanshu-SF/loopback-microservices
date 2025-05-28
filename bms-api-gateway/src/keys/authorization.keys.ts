import {BindingKey} from '@loopback/core';
import {Authorizer} from '@loopback/authorization';

export namespace AuthorizationBindings {
  export const AUTHORIZER = BindingKey.create<Authorizer>('authorization.actions.authorizer');
}
