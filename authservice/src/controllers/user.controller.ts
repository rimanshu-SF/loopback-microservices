import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {inject} from '@loopback/core';
import {securityId, UserProfile} from '@loopback/security';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {TokenService} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {authenticate, STRATEGY} from 'loopback4-authentication';
import * as bcrypt from 'bcrypt';
import { verify } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { RolePermissions } from '../config/role-permission.config';
import { UserRole } from '../enums/role.enum';
export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    private tokenService: TokenService,
  ) {}

// Signup endpoint (without JWT generation)
@post('/jwt/auth/signup')
@response(200, {
  description: 'Signup successfully without JWT',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          user: { type: 'object' },
        },
      },
    },
  },
})
async jwtSignup(
  @requestBody({
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            role: { type: 'string', enum: Object.values(UserRole) },
          },
          required: ['username', 'email', 'password', 'role'],
        },
      },
    },
  })
  userData: { username: string; email: string; password: string; role: UserRole },
): Promise<{ message: string; user: Partial<User> }> {
  // Validate role against Enum
  if (!Object.values(UserRole).includes(userData.role)) {
    throw new Error(`Invalid role. Allowed roles: ${Object.values(UserRole).join(', ')}`);
  }

  // Check if user already exists
  const existingUser = await this.userRepository.findOne({
    where: { email: userData.email },
  });
  if (existingUser) {
    throw new HttpErrors.BadRequest('User with this email already exists');
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  // Assign role-based permissions
  const assignedPermissions = RolePermissions[userData.role];

  // Create the new user
  const newUser = await this.userRepository.create({
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
    role: userData.role,
    permissions: assignedPermissions,
  });

  // Return success message and user details (excluding password)
  return {
    message: 'User registered successfully',
    user: {
      userId: newUser.userId,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      permissions: newUser.permissions,
    },
  };
}


  // Login endpoint
  @post('/jwt/auth/login')
  @response(200, {
    description: 'Login and return JWT',
    content: {
      'application/json': {
        schema: {type: 'object', properties: {token: {type: 'string'}}},
      },
    },
  })
  async jwtLogin(
    @requestBody() credentials: {email: string; password: string},
  ): Promise<{}> {
    const user = await this.userRepository.findOne({
      where: {email: credentials.email},
    });
    if (!user || !user.password) {
      throw new HttpErrors[401]('Invalid credentials');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(credentials.password, user.password);
    if (!passwordMatch) {
      throw new HttpErrors[401]('Invalid credentials');
    }    

    const userPermissions = user.permissions || [];

    // Define user profile with role and permissions
    const userProfile: UserProfile = {
      [securityId]: user.userId!.toString(),
      email: user.email,
      role: user.role || 'User',
      permissions: userPermissions,
    };

    // const token = await this.tokenService.generateToken(userProfile);   
    const token = jwt.sign(userProfile, 'your-jwt-secret')
    await this.userRepository.updateById(user.userId, {token});

    return {
      username: user.username,
      email: user.email,
      token,
      role: user.role || 'User',
    };
}
  // Verify Token Endpoint
  @post('/jwt/auth/verify')
  @response(200, {
    description: 'Verify JWT Token',
    content: {
      'application/json': {
        schema: {type: 'object', properties: {valid: {type: 'boolean'}, payload: '' }},
      },
    },
  })
  async verifyToken(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
            },
            required: ['token'],
          },
        },
      },
    })
    request: {token: string},
  ): Promise<{valid: boolean; payload?: string; error?: string}> {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables.');
      }

      const decoded = verify(request.token, process.env.JWT_SECRET!, {
        issuer: process.env.JWT_ISSUER, 
      });
      const tokenRes = decoded + ''

      return {valid: true, payload: tokenRes};
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return {valid: false, error: 'Invalid token'};
    }
  }


  // List users endpoint
  @get('/users')
  @authenticate(STRATEGY.BEARER)
  @authorize({allowedRoles: ['admin']})
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    // console.log("List User:", filter);
    
    return this.userRepository.find(filter);
  }
}