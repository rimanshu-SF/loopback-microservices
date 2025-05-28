import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {UserDataSource} from '../datasources';
import {User, } from '../models';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.userId
> {
  constructor(
    @inject('datasources.user') dataSource: UserDataSource,
  ) {
    super(User, dataSource);
  }

  
}
