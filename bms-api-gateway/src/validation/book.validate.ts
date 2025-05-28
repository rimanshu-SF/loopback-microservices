import {HttpErrors} from '@loopback/rest';
import {BookInterface} from '../interfaces/controller.interface';
import axios from 'axios';


export class BookValidator {
  private static instance: BookValidator;

  // Private constructor to prevent instantiation
  private constructor() {}


  // Get instance of the BookValidator class
  public static getInstance(): BookValidator {
    if (!BookValidator.instance) {
      BookValidator.instance = new BookValidator();
    }
    return BookValidator.instance;
  }

  // Validation logic
  public async validate(book: BookInterface): Promise<void> {

    // Validate title
    if (!book.title) {
      throw new HttpErrors.BadRequest('Title is required');
    }

    // Validate ISBN
    if (!book.isbn) {
      throw new HttpErrors.BadRequest('ISBN is required');
    }

    // Validate price
    if (!book.price) {
      throw new HttpErrors.BadRequest('Price is required');
    }

    // Validate authorId
    if (!book.authorId || !book.authorId.startsWith('A')) {
      throw new HttpErrors.BadRequest(
        'Author ID is required and must start with "A"',
      );
    }

    // Validate categoryId
    if (!book.categoryId || !book.categoryId.startsWith('C')) {
      throw new HttpErrors.BadRequest(
        'Category ID is required and must start with "C"',
      );
    }

    // Validate price (should be a number)
    if (isNaN(book.price)) {
      throw new HttpErrors.BadRequest('Price must be a valid number');
    }

    // Validate discount percentage (if present, it should be a number between 0 and 100)
    if (book.discountPercentage !== undefined) {
      if (book.discountPercentage < 0 || book.discountPercentage > 100) {
        throw new HttpErrors.BadRequest(
          'Discount percentage must be between 0 and 100',
        );
      }
    }
  }
}
