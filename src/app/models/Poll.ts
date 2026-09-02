import { Option } from "./Option";

export interface Poll {
  id: string;
  question: string;
  status: 'OPEN' | 'CLOSED';
  options: Option[];
  startDate: string;
  endDate: string;
}
