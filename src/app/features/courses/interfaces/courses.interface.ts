export interface Course {
  field: string;
  name: string;
  link: string;
  time: number;
  school: string;
  date: string;
}

export interface CourseList {
  courses: Course[];
}