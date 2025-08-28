import {
  inject
} from '@loopback/core';
import {
  DefaultCrudRepository
} from '@loopback/repository';
import {
  SrmDataSource
} from '../datasources';
import {
  User,
  UserRelations
} from '../models';


// UserRepository for CRUD operations on the User model
export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.userId,
  UserRelations
> {
  // Define belongsTo relations
  //  public readonly role: BelongsToAccessor < Role, typeof User.prototype.userId > ;
  //  public readonly employee: BelongsToAccessor < Employee, typeof User.prototype.userId > ;

  constructor(
    @inject('datasources.pgsqldb') dataSource: SrmDataSource,
    //    @repository.getter('RoleRepository') protected roleRepositoryGetter: Getter < RoleRepository > ,
    //    @repository.getter('EmployeeRepository') protected employeeRepositoryGetter: Getter < EmployeeRepository > ,
  ) {
    super(User, dataSource);
    // Register the relation accessors
    //  this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter);
    //  this.employee = this.createBelongsToAccessorFor('employee', employeeRepositoryGetter);
  }

  // Custom method to find a user by username
  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({
      where: {
        username
      }
    });
  }
}
