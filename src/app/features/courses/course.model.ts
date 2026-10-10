export interface Course {
  field: string;
  name: string;
  link: string;
  /** Hours. The API sends a number or a text such as "40"; it is shown as it comes. */
  time: number | string;
  school: string;
  date: string;
}

export interface CourseList {
  courses: Course[];
}