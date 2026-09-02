import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { finalize, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { HomeService } from './service/home.service';
import { PollCard } from "../../components/poll-card/poll-card";

// Interface baseada na entidade do Spring Boot
export interface Poll {
  id: string;
  question: string;
  status: 'OPEN' | 'CLOSED';
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PollCard],
  template: `
    <div class="py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        @if (isLoading()) {
          <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full size-20 border-b-4 border-white"></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (poll of polls(); track $index) {
              <app-poll-card [poll]="poll" />
            } @empty {
              <div class="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                <p class="text-slate-500 text-lg">Nenhuma enquete encontrada.</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class Home implements OnInit {
  service = inject(HomeService);

  polls = signal<Poll[]>([]);
  isLoading = signal<boolean>(true);

  async ngOnInit() {
    this.isLoading.set(true);
    this.service.getAllPolls()
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: (result) => this.polls.set(result),
    });
  }
}
