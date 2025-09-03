import {bind, BindingScope} from '@loopback/core';
import {addDays, format, subDays} from 'date-fns';

@bind({
  scope: BindingScope.SINGLETON
})
export class DateFormatterService {
  constructor() { }

  /**
   * Formats a date range from an array of dates into a human-readable string.
   * The format will be "Month dd - Month dd, yyyy" if the year is the same,
   * or "Month dd yyyy - Month dd, yyyy" if the years are different.
   *
   * @param dates An array of Date objects or strings. The first element will be
   * the start date and the last element will be the end date.
   * @returns A formatted string of the date range, or an empty string if the input is invalid.
   */
  public formatDateRange(dates: (string)[]): string {

    if (!dates || dates.length < 2) {
      return '';
    }
    console.log(dates)
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);
    console.log(startDate)
    console.log(endDate)
    let formattedStartDate: string;
    console.log(startDate.getFullYear())
    console.log(endDate.getFullYear())
    if (startDate.getFullYear() !== endDate.getFullYear()) {
      formattedStartDate = format(startDate, 'MMM dd yyyy');
    } else {
      formattedStartDate = format(startDate, 'MMM dd');
    }
    const formattedEndDate = format(endDate, 'MMM dd, yyyy');
    return `${formattedStartDate} - ${formattedEndDate}`;
  }

  /**
 * Transforms a flat array of assignments into a structured format
 * grouped by employee and date, suitable for schedule view.
 * @param {Array} assignments - The flat array of assignment objects.
 * @returns {Array} The transformed data, an array of employee objects.
 */
  transformAssignmentsToSchedule(assignments: any[]) {
    const employeeSchedule: any = {};
    const scheduleDates: any = [];
    const formattedScheduleDates: any = [];
    assignments.forEach(assignment => {

      const employeeName = assignment.employeeName;

      const assignmentDate = new Date(assignment.assignmentDate).toISOString().split('T')[0];
      if (!employeeSchedule[employeeName]) {
        employeeSchedule[employeeName] = {
          employeeName: employeeName,
          employeeId: assignment.employeeId,
          roleId: assignment.roleId,
          projectId: assignment.projectId,
          days: []
        };
      }


      if (employeeSchedule[employeeName].days.filter((obj: any) => obj['assignmentDate'] === assignmentDate).length !== 1) {
        employeeSchedule[employeeName].days.push({
          assignmentDate: assignmentDate,
          shiftName: assignment.shiftName,
          shiftStatus: assignment.shiftStatus,
          displayShiftStatus: (assignment.shiftStatus === 'Absent') ? 'Off' : assignment.shiftName,
          shiftColor: (assignment.shiftStatus === 'Absent') ? 'medium' :
            (assignment.shiftName === 'Morning') ? 'success' : (assignment.shiftName === 'Afternoon') ? 'warning' : 'primary'
        });
      }
      if (!scheduleDates.includes(assignmentDate)) {
        scheduleDates.push(assignmentDate)
        formattedScheduleDates.push(format(assignmentDate, 'MMM dd'))
      }
    });

    const formatedSchedule = {
      dateRange: this.formatDateRange(scheduleDates),
      nxtDate: this.getNextDate(scheduleDates),
      previousDate: this.getPreviousDate(scheduleDates),
      frmDates: formattedScheduleDates,
      scheduleDates: scheduleDates,
      employeeSchedule: Object.values(employeeSchedule)
    }

    return formatedSchedule;
  }

  /**
 * Calculates the date immediately following the end date in the array.
 *
 * @param dates An array of Date objects or strings.
 * @returns The next date as a Date object, or null if the input is invalid.
 */
  public getNextDate(dates: (Date | string)[]): string | null {
    if (!dates || dates.length === 0) {
      return null;
    }
    const lastDate = new Date(dates[dates.length - 1]);
    console.log(lastDate);
    console.log(new Date(addDays(dates[dates.length - 1], 1)).toISOString().split('T')[0]);
    return new Date(addDays(dates[dates.length - 1], 1)).toISOString().split('T')[0];
  }

  /**
   * Calculates the date immediately preceding the start date in the array.
   *
   * @param dates An array of Date objects or strings.
   * @returns The previous date as a Date object, or null if the input is invalid.
   */
  public getPreviousDate(dates: (Date | string)[]): string | null {
    if (!dates || dates.length === 0) {
      return null;
    }
    const firstDate = new Date(dates[0]).toISOString().split('T')[0];

    console.log(firstDate)
    console.log(new Date(subDays(firstDate, 1)).toISOString().split('T')[0])
    return new Date(subDays(firstDate, 1)).toISOString().split('T')[0];
  }
}
