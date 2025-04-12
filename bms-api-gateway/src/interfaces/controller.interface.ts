export interface AuthorInterface {
    authorId: string;
    authorName: string;
  }
  export interface BookInterface {
    bookId: string;
    title: string;
    isbn: string;
    price: number;
    discountPercentage: number;
    authorId: string;
    categoryId: string;
    discription: string;
  }
  export interface CategoryInterface {
    categoryId: string;
    genre: string;
  }
  export interface UserSignUpInterface {
    userId: string;
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }
  export interface UserSignInInterface {
    email: string;
    password: string;
  }
  