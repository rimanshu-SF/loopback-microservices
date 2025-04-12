export class Validation {

    static verifySignupData(signupData: any):any{
      if(signupData.password <= 8){
        return `Password must be 8`
      }
      if(signupData.email){
        this.validateEmail(signupData.email)
      }
      if(!signupData.allowedRoles){
        return 'It Required'
      }
      
    }
    static validateEmail(email: string): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    static validatePassword(password: string): boolean {
      return password.length >= 8; 
    }
  
    static allowedRoles = ['User', 'Admin', 'Librarian'];
  
    static validateRole(role: string): boolean {
      return this.allowedRoles.includes(role);
    }
  }
  