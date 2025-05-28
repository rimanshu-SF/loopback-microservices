import {Provider} from '@loopback/context';
import {verify} from 'jsonwebtoken';
import {VerifyFunction} from 'loopback4-authentication';
// import {User} from '../models/user.model';

export class BearerTokenVerifyProvider
  implements Provider<VerifyFunction.BearerFn>
{
  constructor(  ) {}

  value(): VerifyFunction.BearerFn {    
    return async token => {        
      const user = verify(token, process.env.JWT_SECRET as string) as any;            
      return user;
    };
  }
}