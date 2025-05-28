import { injectable, BindingScope } from '@loopback/core';
import { HttpErrors } from '@loopback/rest';
import { verify, JwtPayload } from 'jsonwebtoken';

@injectable({ scope: BindingScope.SINGLETON })
export class CustomJWTService {
  async verifyToken(token: string): Promise<JwtPayload | string> {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables.');
      }      
      const decoded = verify(token, process.env.JWT_SECRET!);     
      return decoded;
    } catch (error) {
      throw new HttpErrors.Unauthorized('Invalid token');
    }
  }
}
