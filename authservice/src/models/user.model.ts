import {Entity, model, property} from '@loopback/repository';
import { UserRole } from '../enums/role.enum';
import { Permission } from '../enums/permissions.enum';


@model()
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true, 
  })
  userId?: number;
  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: false,
  })
  token?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(UserRole),
    },
  })
  role: UserRole;

  @property({
    type: 'array',
    itemType: 'string',
    jsonSchema: {
      enum: Object.values(Permission),
    },
  })
  permissions: Permission[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}