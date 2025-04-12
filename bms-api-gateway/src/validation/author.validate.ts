import {HttpErrors} from '@loopback/rest';
import {AuthorInterface} from '../interfaces/controller.interface'

export class AuthorValidator {
  private static instance: AuthorValidator;

  // Private constructor to prevent instantiation
  private constructor() {}

  // Get instance of the AuthorValidator class
  public static getInstance(): AuthorValidator {
    if (!AuthorValidator.instance) {
      AuthorValidator.instance = new AuthorValidator();
    }
    return AuthorValidator.instance;
  }

  // Validation logic
  public validate(author: AuthorInterface): void {
    if (!author.authorName) {
      throw new HttpErrors.BadRequest('AuthorName is required');
    }
  }
}
