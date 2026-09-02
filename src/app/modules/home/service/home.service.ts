import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Poll } from '../../../models/Poll';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private http = inject(HttpClient);
  private baseUrl = "http://localhost:8080/api";

  getAllPolls(): Observable<Poll[]> {
    return this.http.get<Poll[]>(`${this.baseUrl}/polls`);
  }
}
