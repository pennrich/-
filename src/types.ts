export interface Student {
  id: string;
  name: string;
  isPoorVision: boolean;
}

export interface Seat {
  id: string; // e.g. "seat-r-c"
  row: number; // 0-based index (0 is closest to the front/teacher)
  col: number; // 0-based index
  isDisabled: boolean; // if true, this physical desk does not exist (blacked out)
  studentId: string | null; // the student assigned to this seat
}

export enum AppStep {
  GRID_SIZE = 1,
  SEAT_DISABLE = 2,
  STUDENT_INPUT = 3,
  POOR_VISION = 4,
  GAMIFIED_DRAW = 5,
  FINAL_VIEW = 6,
}

export interface SeatingHistory {
  id: string;
  timestamp: string;
  rows: number;
  cols: number;
  seats: Seat[];
  students: Student[];
}
