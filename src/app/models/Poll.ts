export interface Poll {
  id: string;
  question: string;
  status: 'OPEN' | 'CLOSED';
  startDate: string;
  endDate: string;
}
