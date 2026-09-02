import { Observable } from "rxjs";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { HttpClient } from "@angular/common/http";
import { Injectable, signal, inject } from "@angular/core";

import { Poll } from "../../../models/Poll";
import { Option } from "../../../models/Option";

@Injectable({
  providedIn: "root"
})
export class PollService {
  private http = inject(HttpClient);
  private stompClient: Client | null = null;
  private baseUrl = "http://localhost:8080/api";
  private wsUrl = "http://localhost:8080/ws-polls";

  public options = signal<Option[]>([]);

  getPollDetails(id: string): Observable<Poll> {
    return this.http.get<Poll>(`${this.baseUrl}/polls/${id}`);
  }

  loadOptions(pollId: string): Observable<Option[]> {
    return this.http.get<Option[]>(`${this.baseUrl}/polls/${pollId}`);
  }

  connectWS(pollId: string): void {
    if (this.stompClient && this.stompClient.active) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,

      onConnect: () => {
        this.stompClient?.subscribe(`/topic/polls/${pollId}`, (message) => {
          const updatedOption: Option = JSON.parse(message.body);

          this.options.update((prev) => prev.map((option) =>
            option.id === updatedOption.id ? updatedOption : option
          ));
        });
      },
      onWebSocketError: (evt) => console.error('Erro no WebSocket subjacente:', evt),
      onStompError: (frame) => console.error('Falha de comunicação com o broker STOMP:', frame.headers['message']),
    });

    this.stompClient.activate();
  }

  vote(optionId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/votes/${optionId}`, {});
  }

  disconnectWS(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }
}
