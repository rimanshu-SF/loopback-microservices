import {HttpErrors} from '@loopback/rest';
import {
  UserSignInInterface,
  UserSignUpInterface,
} from '../interfaces/controller.interface';

export class UserValidator {
  private static instance: UserValidator;

  // Private constructor to prevent instantiation
  private constructor() {}

  // Get instance of the UserValidator class
  public static getInstance(): UserValidator {
    if (!UserValidator.instance) {
      UserValidator.instance = new UserValidator();
    }
    return UserValidator.instance;
  }

  // Validation logic
  public validateLogIn(user: UserSignInInterface): void {
    if (!user.email) {
      throw new HttpErrors.BadRequest('Email is required');
    }
    if (!user.password || user.password.length < 7) {
      throw new HttpErrors.BadRequest('Password is required');
    }
  }
  public validateSignUp(user: UserSignUpInterface): void {
    const isValidEmail = (email: string): boolean => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };
    
    if (!user.email || !isValidEmail) {
      throw new HttpErrors.BadRequest('Email must be valid');
    }
    if (!user.username) {
      throw new HttpErrors.BadRequest('UserName is required');
    }
    if (!user.password) {
      throw new HttpErrors.BadRequest('Password is required');
    }
    if (!user.role) {
      throw new HttpErrors.BadRequest('Role is required');
    }
    if (
      user.role !== 'Admin' &&
      user.role !== 'User' &&
      user.role !== 'Librarian'
    ) {
      throw new HttpErrors.BadRequest(
        'Role must be',
      );
    }
    if (user.password.length < 8) {
      throw new HttpErrors.BadRequest('Password must be at least 8 characters');
    }
    if (user.username.length < 3) {
      throw new HttpErrors.BadRequest('Username must be at least 4 characters');
    }
  }
}
