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
      schema: 'organization',
      table: 'vw_managers_project'
    }
  }
})
export class Projects extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'pid',
    },
  })
  pId?: number;

  @property({
    type: 'number'
  })
  managerId?: number;
  @property({
    type: 'number',
  })
  roleId?: number;


  @property({
    type: 'string',


  })
  projectName?: string;

  @property({
    type: 'string',

  })
  managerName?: string;

  @property({
    type: 'string',

  })
  projectStatus?: string;

  @property({
    type: 'string',

  })
  description?: string;





  constructor(data?: Partial<Projects>) {
    super(data);
  }
}

export interface ProjectsRelations {

}
export type ProjectsWithRelations = Projects & ProjectsRelations
