import {
  Entity,
  model,
  property
} from '@loopback/repository';


// Define the User model for authentication and user management
@model({
  settings: {
    strict: true,
    postgresql: {
      schema: 'iam',
      table: 'users'
    }
  }
})
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'user_id',
    },
  })
  userId?: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'employee_id',
    },
  })
  employeeId: number;


  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'username',
      unique: true,
    },
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'password_hash',
    },
  })
  passwordHash: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'salt',
    },
  })
  salt: string;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'role_id',
    },
  })
  roleId?: number;

  @property({
    type: 'boolean',
    default: true,
    postgresql: {
      columnName: 'is_active',
    },
  })
  isActive?: boolean;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'last_login',
    },
  })
  lastLogin?: Date;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {

}
export type UserWithRelations = User & UserRelations
