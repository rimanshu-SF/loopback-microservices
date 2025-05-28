import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {AuthenticationComponent,  Strategies} from 'loopback4-authentication';
import { JWTAuthenticationComponent, TokenServiceBindings } from '@loopback/authentication-jwt';
import { AuthorizationBindings, AuthorizationComponent } from 'loopback4-authorization';
import { BearerTokenVerifyProvider } from './providers/user.provider';

export {ApplicationConfig};

export class AuthserviceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));
    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    this.component(JWTAuthenticationComponent);
    // Add authentication component
    this.component(AuthenticationComponent);
    this.bind(AuthorizationBindings.CONFIG).to({allowAlwaysPaths: ['/explorer']})
    this.component(AuthorizationComponent);
    this.bind(Strategies.Passport.BEARER_TOKEN_VERIFIER).toProvider(
      BearerTokenVerifyProvider,
    );
    this.bind(TokenServiceBindings.TOKEN_SECRET).to('your-jwt-secret');
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to('3600');    
  }
}
