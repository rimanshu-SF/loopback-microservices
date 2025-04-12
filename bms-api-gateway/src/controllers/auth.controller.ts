import { post, requestBody } from '@loopback/rest';
import axios from 'axios';
import { HttpErrors } from '@loopback/rest';
import dotenv from 'dotenv';
import { UserValidator } from '../validation/user.validate';

dotenv.config();


export class AuthController {
  constructor() {}

  @post('/signup')
  async postSignup(@requestBody() userData: any): Promise<any> {
    try {
      // Make the downstream request
      UserValidator.getInstance().validateSignUp(userData);
      const response = await axios.post(`${process.env.BASE_URL_USER_SIGNUP}`, userData);
      return response.data;
    } catch (error) {
      if ((error.status >= 400) && (error.status <= 499) ){
        throw new HttpErrors.BadRequest(`Email already Registered`);
      }
      throw new HttpErrors.InternalServerError(`Failed to create user: ${error.message}`);
    }
  }
  @post('/login')
  async postLogin(@requestBody() userData: any): Promise<any> {
    try {
      // Validate email and password
      UserValidator.getInstance().validateLogIn(userData);
      const response = await axios.post(`${process.env.BASE_URL_USER_LOGIN}`, userData);
      return response.data;
    } catch (error) {
      if (error.status >= 401 ){
        throw new HttpErrors.BadRequest(`Wrong Email or Password`);
      }
      if ((error.status >= 400) && (error.status <= 499) ){
        throw new HttpErrors.BadRequest(`Email and Password Required`);
      }
      throw new HttpErrors.InternalServerError(`Failed to Login you: ${error.message}`);
    }
  }
}
