import {
  inject
} from '@loopback/core';
import {
  DefaultCrudRepository
} from '@loopback/repository';
import {endOfMonth, format, startOfMonth} from 'date-fns';
import {
  SrmDataSource
} from '../datasources';
import {
  ProjectSchedule,
  ProjectScheduleRelations
} from '../models';


export class ProjectScheduleRepository extends DefaultCrudRepository<
  ProjectSchedule,
  typeof ProjectSchedule.prototype.assignmentId,
  ProjectScheduleRelations
> {

  constructor(
    @inject('datasources.pgsqldb') dataSource: SrmDataSource,

  ) {
    super(ProjectSchedule, dataSource);

  }

  /*async getProjectSchedule(ProjectId: number): Promise<ProjectSchedule | null> {
    return this.findOne({
      where: {
        projectId: ProjectId
      }
    });
  }*/

  async findProjectAssignmentsByMonth(projectId: number, monthDate: string | Date): Promise<any> {
    try {
      const date = new Date(monthDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date provided.');
      }
      const start = startOfMonth(date).toISOString().split('T')[0];
      const end = endOfMonth(date).toISOString().split('T')[0];
      console.log(`Searching for assignments from: ${start} to: ${end}`);
      /* const sqlQuery = `SELECT * FROM schedule.vw_project_employee_overview WHERE project_id = $1 and assignment_date >= $2 AND assignment_date < $3`;
       console.log("result,result:", sqlQuery)
       const params = [projectId, format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd')];
       console.log("result,result:", params)

       const result = await this.dataSource.execute(sqlQuery, params);
       //console.log("result,result:", result)
       return result;*/

      const filter = {
        where: {
          projectId: projectId,
          assignmentDate: {
            gte: format(start, 'yyyy-MM-dd'),
            lt: format(end, 'yyyy-MM-dd'),
          },
        },
      };
      const assignments = await this.find(filter);
      return assignments;
    } catch (error) {
      console.error('Error finding assignments by month:', error);
      return [];
    }
  }



}
