import {del, get, param, patch, post, response,requestBody} from '@loopback/rest';
import axios, {AxiosError} from 'axios';
import {
  validateAuthorPost,
  validateAuthorPatch,
  validateBookPost,
  validateBookPatch,
  validateCategoryPost,
  validateCategoryPatch,
} from '../validation/validation';
import {HttpErrors} from '@loopback/rest';
import dotenv from 'dotenv';
import { authenticate, STRATEGY, Strategy } from 'loopback4-authentication';
import { authorize } from 'loopback4-authorization';
// import { Validation } from '../validation/user.validation';
import logger from '../services/logger.service';
import { Client } from '@opensearch-project/opensearch/.';
import { AuthorValidator } from '../validation/author.validate';
import { BookValidator } from '../validation/book.validate';
import { CategoryValidator } from '../validation/category.validate';


dotenv.config();


export class GatewayController {
  // function to fetch author by name
  private async getAuthorByName(name: string): Promise<any> {
    try {
      const response = await axios.get(`${process.env.BASE_URL_AUTHORS}`);
      const authors = response.data;
      const author = authors.find((a: any) => a.authorName.toLowerCase() === name.toLowerCase());
      // if (!author) {
      //   throw new HttpErrors.NotFound(`Author with name "${name}" not found`);
      // }
      return author;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(`Failed to fetch authors: ${error.message}`);
    }
  }

  // function to fetch category by name
  public async getCategoryByName(genre: string): Promise<any> {
    try {
      const response = await axios.get(`${process.env.BASE_URL_CATEGORIES}`);
      const categories = response.data;
      const category = categories.find((c: any) => c.genre.toLowerCase() === genre.toLowerCase());
      // if (!category) {
      //   throw new HttpErrors.NotFound(`Category with name "${genre}" not found`);
      // }
      return category
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(`Failed to fetch categories: ${error.message}`);
    }
  }


  // Author Endpoints
  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_AUTHOR']})
  @get('/authors')
  async getAuthors(): Promise<any> {
    try {
      const response = await axios.get(`${process.env.BASE_URL_AUTHORS}`);
      
      logger.info({
        message: 'Successfully retrieved authors',
        route: '/authors',
        method: 'GET',
        timestamp: new Date().toISOString(),
      });
  
      return response.data;
    } catch (error) {
      logger.error({
        message: 'Failed to retrieve authors',
        route: '/authors',
        method: 'GET',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      throw new HttpErrors.InternalServerError(`Failed to retrieve authors: ${error.message}`);
    }
  }
  

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['POST_AUTHOR']})
  @post('/authors')
  async postAuthors(@requestBody() authorData: any): Promise<any> {
    try {
      AuthorValidator.getInstance().validate(authorData);
      if(authorData.authorName){
        const author = await this.getAuthorByName(authorData.authorName)
        console.log("getAuthorByName", author);
        if(author){
          throw new HttpErrors.BadRequest('Author Already Exist');
        }
      }
      const response = await axios.post(`${process.env.BASE_URL_AUTHORS}`, authorData);
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(`Failed to create author: ${error.message}`);
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['PATCH_AUTHOR']})
  @patch('/authors/{id}')
  async updateAuthor(
    @param.path.string('id') id: string,
    @requestBody() authorData: any,
  ): Promise<any> {
    try {
      AuthorValidator.getInstance().validate(authorData);
      const response = await axios.patch(`${process.env.BASE_URL_AUTHORS}/${id}`, authorData);
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(`Failed to update author: ${error.message}`);
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['DELETE_AUTHOR']})
  @del('/authors/{id}')
  async deleteAuthor(@param.path.number('id') id: number): Promise<any> {
    try {
      const response = await axios.delete(`${process.env.BASE_URL_AUTHORS}/${id}`);
      return response.data;
    } catch (error) {
      throw new HttpErrors.InternalServerError(`Failed to delete author: ${error.message}`);
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_AUTHOR_BY_ID']})
  @get('/authors/{id}')
  async getAuthorById(@param.path.string('id') id: string): Promise<any> {
    try {
      const response = await axios.get(`${process.env.BASE_URL_AUTHORS}/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new HttpErrors.NotFound(`Author with ID "${id}" not found`);
      }
      throw new HttpErrors.InternalServerError(`Failed to retrieve author: ${error.message}`);
    }
  }

  // Book Endpoints
  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_BOOK']})
  @get('/books')
  async getBooks(): Promise<any> {
    try {
      const booksResponse = await axios.get(`${process.env.BASE_URL_BOOKS}`);
      const books = booksResponse.data;            
      const enrichedBooks = await Promise.all(
        books.map(async (book: any) => {
          try {
            const author = await axios.get(`${process.env.BASE_URL_AUTHORS}/${book.authorId}`).then(res => res.data);
            const category = book.categoryId
              ? await axios.get(`${process.env.BASE_URL_CATEGORIES}/${book.categoryId}`).then(res => res.data)
              : null;
            return { ...book, author, category };
          } catch (error) {
            console.log("Error:",error);
            throw new HttpErrors.InternalServerError(
              `Failed to enrich books: ${error.message}`
            );
          }
        })
      );
      return enrichedBooks;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(`Failed to retrieve books: ${error.message}`);
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['POST_BOOK']})
  @post('/books')
  async postBooks(@requestBody() bookData: any): Promise<any> {
    try {      
      BookValidator.getInstance().validate(bookData);

      // const author = await this.getAuthorByName(bookData.authorName);
      let author = null;
      if(bookData.authorName){
        author = await this.getAuthorByName(bookData.authorName)
        console.log("getAuthorByName", author);
        if(!author){
          throw new HttpErrors.BadRequest('Author not Found');
        }
      }
      const authorId = author.authorId;
      console.log("BookData:", bookData);
      
      let categoryId = null;
      let category = null;
      if (bookData.genre) {
        category = await this.getCategoryByName(bookData.genre);
        console.log("categoryResultFromPOSTBOOK",category);
        if(!category){
          throw new HttpErrors.BadRequest('Genre is Not Found');
        }else{
          categoryId = category.categoryId;
        }
      }

      delete bookData.authorName;
      delete bookData.categoryName;
      const bookDataPayload = { ...bookData, authorId, categoryId };

      const response = await axios.post(process.env.BASE_URL_BOOKS as string, bookDataPayload);
      const createdBook = response.data;

      return { ...createdBook, author, category };
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error; 
      throw new HttpErrors.InternalServerError(`Failed to create book: ${error.message}`);
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['PATCH_BOOK',]})
  @patch('/books/{id}')
  async updateBook(
    @param.path.string('id') id: string,
    @requestBody() bookData: any,
  ): Promise<any> {
    try {
      BookValidator.getInstance().validate(bookData);

      const updatedData: any = {};
      if (bookData.title) updatedData.title = bookData.title;
      if (bookData.authorName) {
        const author = await this.getAuthorByName(bookData.authorName);
        updatedData.authorId = author.authorId;
      }
      if (bookData.categoryName) {
        const category = await this.getCategoryByName(bookData.categoryName);
        updatedData.categoryId = category.categoryId;
      }

      const response = await axios.patch(`${process.env.BASE_URL_BOOKS}/${id}`, updatedData);
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(`Failed to update book: ${error.message}`);
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['DELETE_BOOK']})
  @del('/books/{id}')
  async deleteBook(@param.path.string('id') id: string): Promise<any> {
    try {
      const response = await axios.delete(`${process.env.BASE_URL_BOOKS}/${id}`);
      return response.data;
    } catch (error) {
      throw new HttpErrors.InternalServerError(`Failed to delete book: ${error.message}`);
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_BOOK_BY_ID']})
  @get('/books/{id}')
  async getBookById(@param.path.string('id') id: string): Promise<any> {
    try {
      const bookResponse = await axios.get(`${process.env.BASE_URL_BOOKS}/${id}`);
      const book = bookResponse.data;

      const author = await axios.get(`${process.env.BASE_URL_AUTHORS}/${book.authorId}`).then(res => res.data);
      const category = book.categoryId
        ? await axios.get(`${process.env.BASE_URL_CATEGORIES}/${book.categoryId}`).then(res => res.data)
        : null;

      return { ...book, author, category };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new HttpErrors.NotFound(`Book with ID "${id}" not found`);
      }
      throw new HttpErrors.InternalServerError(`Failed to retrieve book: ${error.message}`);
    }
  }

  // Category Endpoints
  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_CATEGORY']})
  @get('/categories')
  async getCategories(): Promise<any> {
    try {
      const response = await axios.get(`${process.env.BASE_URL_CATEGORIES}`);
      return response.data;
    } catch (error) {
      throw new HttpErrors.InternalServerError(`Failed to retrieve categories: ${error.message}`);
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['POST_CATEGORY']})
  @post('/categories')
  async categoryPost(@requestBody() categoryData: any): Promise<any> {
    try {
      CategoryValidator.getInstance().validate(categoryData);
      
      const categoryResult = await this.getCategoryByName(categoryData.genre);
      if(categoryResult){
        console.log("categoryResult",categoryResult);
        throw new HttpErrors.BadRequest('Genre is Already Exist');
      }
      const response = await axios.post(`${process.env.BASE_URL_CATEGORIES}`, categoryData);
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(`Failed to create category: ${error.message}`);
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['PATCH_BOOK']})
  @patch('/categories/{id}')
  async updateCategory(
    @param.path.string('id') id: string,
    @requestBody() categoryData: any,
  ): Promise<any> {
    try {
      CategoryValidator.getInstance().validate(categoryData);
      const response = await axios.patch(`${process.env.BASE_URL_CATEGORIES}/${id}`, categoryData);
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(`Failed to update category: ${error.message}`);
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['DELETE_BOOK']})
  @del('/categories/{id}')
  async deleteCategory(@param.path.number('id') id: number): Promise<any> {
    try {
      const response = await axios.delete(`${process.env.BASE_URL_CATEGORIES}/${id}`);
      return response.data;
    } catch (error) {
      throw new HttpErrors.InternalServerError(`Failed to delete category: ${error.message}`);
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_CATEGORY_BY_ID']})
  @get('/categories/{id}')
  async getCategoryById(@param.path.string('id') id: string): Promise<any> {
    try {
      const response = await axios.get(`${process.env.BASE_URL_CATEGORIES}/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new HttpErrors.NotFound(`Category with ID "${id}" not found`);
      }
      throw new HttpErrors.InternalServerError(`Failed to retrieve category: ${error.message}`);
    }
  }

}