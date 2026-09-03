import { finalize } from "rxjs";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, OnDestroy, inject, signal, computed } from "@angular/core";

import { Poll } from "../../models/Poll";
import { PollService } from "./service/poll.service";
import { Loading } from "../../components/loading/loading";
import { BackPage } from "../../components/backPage/backPage";
import { TagStatus } from "../../components/tag-status/tag-status";

@Component({
  selector: 'app-poll-view',
  standalone: true,
  imports: [CommonModule, BackPage, Loading, TagStatus],
  template: `
    <div class="sm:px-6 lg:px-8 relative">
      <app-back-page />

      <div class="max-w-2xl mx-auto">
        @if (isLoading()) { <app-loading /> }
        @else if (poll()) {
          <div class="bg-gray-800 rounded-xl shadow-sm border border-gray-400 overflow-hidden">
            <div class="flex flex-col gap-2 p-6 sm:p-8 border-b border-gray-400">
              <div class="flex justify-between items-start gap-2">
                <h1 class="text-2xl font-bold text-slate-100 leading-tight">
                  {{ poll()?.question }}
                </h1>

                <app-tag-status [status]="poll()?.status!" />
              </div>

              <p class="text-sm text-slate-400">
                Total de votos computados: <span class="font-bold text-green-400">{{ totalVotes() }}</span>
              </p>
            </div>

            <div class="p-6 sm:p-8 bg-gray-800 space-y-4">
              @for (option of service.options(); track $index) {
                <button
                  (click)="handleVote(option.id)"
                  [disabled]="poll()?.status === 'CLOSED' || isVoting()"
                  class="relative w-full bg-gray-700 text-left overflow-hidden rounded-xl border p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 group"
                  [ngClass]="{
                    'border-gray-400 opacity-80 cursor-not-allowed': poll()?.status === 'CLOSED',
                    'border-gray-400 hover:border-orange-300 hover:shadow-md cursor-pointer': poll()?.status === 'OPEN',
                  }"
                >

                <div class="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-700 ease-out"
                    [style.width.%]="getPercentage(option.votes)">
                </div>

                <div class="relative z-10 flex justify-between items-center gap-4">
                  <span class="font-medium text-gray-200 text-lg group-hover:text-orange-300 transition-colors">
                    {{ option.text }}
                  </span>

                  <div class="flex flex-col items-end shrink-0">
                    <span class="text-base font-bold text-gray-200">
                      {{ getPercentage(option.votes) | number:'1.0-1' }}%
                    </span>

                    <span class="text-xs text-gray-400 font-medium">
                      {{ option.votes }} {{ option.votes === 1 ? 'voto' : 'votos' }}
                    </span>
                  </div>
                </div>
              </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PollView implements OnInit, OnDestroy {
  private router = inject(Router);
  public service = inject(PollService);
  private route = inject(ActivatedRoute);

  poll = signal<Poll | null>(null);
  isLoading = signal<boolean>(true);
  isVoting = signal<boolean>(false);

  totalVotes = computed(() => {
    return this.service.options().reduce((acc, current) => acc + current.votes, 0);
  });

  ngOnInit() {
    const pollId = this.route.snapshot.paramMap.get('id');

    if (pollId) {
      this.isLoading.set(true);
      this.service.getPollDetails(pollId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          this.poll.set(result);
          this.service.options.set(result.options);

          this.service.connectWS(pollId);
        },
        error: (err) => {
          console.error("Erro ao buscar detalhes da enquete", err);
          this.router.navigate(["/"]);
        }
      });
    }
  }

  ngOnDestroy() {
    this.service.disconnectWS();
  }

  handleVote(optionId: string) {
    if (this.poll()?.status === "CLOSED" || this.isVoting()) return;

    this.isVoting.set(true);
    this.service.vote(optionId).subscribe({
      next: () => setTimeout(() => this.isVoting.set(false), 500),
      error: (err) => console.error("Erro ao registrar voto via REST:", err),
    });
  }

  getPercentage(votes: number): number {
    const total = this.totalVotes();
    if (total === 0) return 0;
    return (votes / total) * 100;
  }
}
