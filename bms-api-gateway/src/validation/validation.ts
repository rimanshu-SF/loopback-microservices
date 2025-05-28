import {HttpErrors} from '@loopback/rest';

// Author Validation
export const validateAuthorPost = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  if (!data.authorName || typeof data.authorName !== 'string') {
    throw new HttpErrors.BadRequest('Name is required and must be a string');
  }
};

export const validateAuthorPatch = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  if (data.authorName && typeof data.authorName !== 'string') {
    throw new HttpErrors.BadRequest('Name must be a string');
  }
};

// Book Validation
export const validateBookPost = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  if (!data.title || typeof data.title !== 'string') {
    throw new HttpErrors.BadRequest('Title is required and must be a string');
  }
  if (!data.isbn || typeof data.isbn !== 'string') {
    throw new HttpErrors.BadRequest('ISBN is required and atleast 13');
  }
  if (!data.price || typeof data.price !== 'number') {
    throw new HttpErrors.BadRequest('Price is required');
  }
  if (!data.authorName || typeof data.authorName !== 'string') {
    throw new HttpErrors.BadRequest('Author name is required and must be a string');
  }
  if (data.categoryName && typeof data.categoryName !== 'string') {
    throw new HttpErrors.BadRequest('Category name must be a string');
  }
};

export const validateBookPatch = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  if (data.title && typeof data.title !== 'string') {
    throw new HttpErrors.BadRequest('Title must be a string');
  }
  if (!data.price || typeof data.price !== 'number') {
    throw new HttpErrors.BadRequest('ISBN is required and atleast 13');
  }
};

// Category Validation
export const validateCategoryPost = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  console.log("Data:",data);
  
  if (!data.categoryName || typeof data.categoryName !== 'string') {
    throw new HttpErrors.BadRequest('Genre is required and must be a string');
  }
};

export const validateCategoryPatch = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  if (data.genre && typeof data.genre !== 'string') {
    throw new HttpErrors.BadRequest('Name must be a string');
  }
};