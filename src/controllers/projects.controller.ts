import {inject} from '@loopback/core';
import {
  Filter,
  repository
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response
} from '@loopback/rest';
import {Projects} from '../models';
import {ProjectScheduleRepository, ProjectsRepository} from '../repositories';
import {DateFormatterService} from '../services/date-formatter.service';
export class ProjectController {
  constructor(
    @repository(ProjectsRepository)
    public projectsRepo: ProjectsRepository,
    @repository(ProjectScheduleRepository)
    public projectScheduleRepo: ProjectScheduleRepository,
    @inject('services.DateFormatterService') private dateFormatter: DateFormatterService,
  ) { }

  /**
   * GET /projects/{managerId}
   * Get a list of all projects managed by a specific manager.
   */
  @get('/projects/getProjects/{managerId}')
  @response(200, {
    description: 'Array of projects under a specific manager',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Projects, {includeRelations: true}),
        },
      },
    },
  })
  async getProjectsByManager(
    @param.path.number('managerId') managerId: number,
  ): Promise<Projects[]> {
    const filter: Filter<Projects> = {where: {managerId}};
    return this.projectsRepo.find(filter);
  }

  /**
   * GET /projects/{managerId}
   * Get a list of all projects managed by a specific manager.
   */
  @get('/projects/project-details/{managerId}/{projectId}')
  @response(200, {
    description: 'project detail of a specific project and under a specific manager',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          items: getModelSchemaRef(Projects, {includeRelations: true}),
        },
      },
    },
  })
  async getProjectDetailByManager(
    @param.path.number('managerId') managerId: number,
    @param.path.number('projectId') projectId: number,
  ): Promise<Projects | null> {
    const filter: Filter<Projects> = {where: {managerId, pId: projectId}};
    return this.projectsRepo.findOne(filter);
  }

  /**
 * GET /projects/{managerId}
 * Get a list of all projects managed by a specific manager.
 */

  //@get('/projects/project-overview/{managerId}/{projectId}')
  /*@response(200, {
    description: 'project detail of a specific project and under a specific manager',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          items: getModelSchemaRef(Projects, {includeRelations: true}),
        },
      },
    },
  })*/
  @post('/projects/project-overview')
  async getProjectOverview(@requestBody() datareq: {
    projectId: number,
    date: string
  }): Promise<any> {
    console.log(datareq)
    const assignments = await this.projectScheduleRepo.findProjectAssignmentsByMonth(datareq.projectId, datareq.date);
    console.log(assignments)
    const scheduledData = await this.dateFormatter.transformAssignmentsToSchedule(await assignments);
    return scheduledData;
  }






}
