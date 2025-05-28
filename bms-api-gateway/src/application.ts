import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {TokenServiceBindings, JWTService} from '@loopback/authentication-jwt';
import {AuthorizationBindings, AuthorizationComponent} from 'loopback4-authorization';
import {AuthorizationBindings as CustomAuthBindings} from './keys/authorization.keys'; 
import { CustomJWTService } from './services/jwt.service';
import { MyAuthorizationProvider } from './providers/authorize.provider';
import { AuthenticationComponent, Strategies } from 'loopback4-authentication';
import { BearerTokenVerifyProvider } from './providers/user.provider';
import { AuthController } from './controllers';
export {ApplicationConfig};

export class BmsApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.sequence(MySequence);

    this.static('/', path.join(__dirname, '../public'));

    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.controller(AuthController)
    this.bind(CustomAuthBindings.AUTHORIZER).toProvider(MyAuthorizationProvider);

    this.component(AuthenticationComponent)
    this.bind(AuthorizationBindings.CONFIG).to({
      allowAlwaysPaths: ['/explorer', '/signup', '/login'],
    });
    this.component(AuthorizationComponent);
  
    this.bind('services.JWTService').toClass(CustomJWTService);
    // Bind JWT configuration (match authService)
    // this.bind(TokenServiceBindings.TOKEN_SECRET).to('your-jwt-secret');
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to('3600');
    // this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(Strategies.Passport.BEARER_TOKEN_VERIFIER).toProvider(
      BearerTokenVerifyProvider,
    );

  }
}