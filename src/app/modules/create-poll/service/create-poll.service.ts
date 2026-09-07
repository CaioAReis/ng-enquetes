import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { Poll } from "../../../models/Poll";

@Injectable({
  providedIn: "root"
})
export class CreatePollService {
  private http = inject(HttpClient);
  private baseUrl = "http://localhost:8080/api";

  create(body: any): Observable<Poll> {
    return this.http.post<Poll>(`${this.baseUrl}/polls`, body);
  }
}
