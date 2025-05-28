import {HttpErrors} from '@loopback/rest';
import {CategoryInterface} from '../interfaces/controller.interface';

export class CategoryValidator {
  private static instance: CategoryValidator;

  // Private constructor to prevent instantiation
  private constructor() {}

  // Get instance of the CategoryValidator class
  public static getInstance(): CategoryValidator {
    if (!CategoryValidator.instance) {
      CategoryValidator.instance = new CategoryValidator();
    }
    return CategoryValidator.instance;
  }

  // Validation logic
  public validate(category: CategoryInterface): void {
    if (!category.genre) {
      throw new HttpErrors.BadRequest('CategoryName is required');
    }
  }
}
