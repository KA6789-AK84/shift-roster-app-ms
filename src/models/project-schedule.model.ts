import {
  Entity,
  model,
  property
} from '@loopback/repository';

@model({
  settings: {
    strict: true,
    postgresql: {
      schema: 'schedule',
      table: 'vw_project_employee_overview'
    }
  }
})
export class ProjectSchedule extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'assignment_id',
    },
  })
  assignmentId?: number;
  @property({
    type: 'number',
    postgresql: {
      columnName: 'project_id',
    },
  })
  projectId?: number;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'employee_id',
    },
  })
  employeeId?: number;
  @property({
    type: 'number',
    postgresql: {
      columnName: 'role_id',
    },
  })
  roleId?: number;
  @property({
    type: 'string',
    postgresql: {
      columnName: 'project_name',
    },
  })
  projectName?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'employee_name',
    },
  })
  employeeName?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'email',
    },
  })
  employeeEmail?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'shift_name',
    },
  })
  shiftName?: string;
  @property({
    type: 'string',
    postgresql: {
      columnName: 'shiftstatus',
    },
  })
  shiftStatus?: string;

  @property({
    type: 'Date',
    postgresql: {
      columnName: 'assignment_date',
    },
  })
  assignmentDate?: string;





  constructor(data?: Partial<ProjectSchedule>) {
    super(data);
  }
}

export interface ProjectScheduleRelations {

}
export type ProjectScheduleithRelations = ProjectSchedule & ProjectScheduleRelations
