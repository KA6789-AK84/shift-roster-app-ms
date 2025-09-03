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
  Projects,
  ProjectsRelations
} from '../models';



export class ProjectsRepository extends DefaultCrudRepository<
  Projects,
  typeof Projects.prototype.pId,
  ProjectsRelations
> {

  constructor(
    @inject('datasources.pgsqldb') dataSource: SrmDataSource,

  ) {
    super(Projects, dataSource);

  }

  async getProjectsByManager(managerId: number): Promise<Projects | null> {
    return this.findOne({
      where: {
        managerId: managerId
      }
    });
  }
}
