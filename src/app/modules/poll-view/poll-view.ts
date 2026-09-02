import { finalize } from "rxjs";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, OnDestroy, inject, signal, computed } from "@angular/core";

import { Poll } from "../../models/Poll";
import { PollService } from "./service/poll.service";
import { Loading } from "../../components/loading/loading";
import { BackPage } from "../../components/backPage/backPage";

@Component({
  selector: 'app-poll-view',
  standalone: true,
  imports: [CommonModule, BackPage, Loading],
  template: `
    <div class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto">
        <app-back-page />

        @if (isLoading()) { <app-loading /> }

        <!-- Poll Content -->
        <div *ngIf="!isLoading() && poll()" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

          <!-- Header da Enquete -->
          <div class="p-6 sm:p-8 border-b border-slate-100">
            <div class="flex justify-between items-start gap-4 mb-4">
              <h1 class="text-2xl font-extrabold text-slate-900 leading-tight">
                {{ poll()?.question }}
              </h1>
              <span [ngClass]="{
                      'bg-emerald-100 text-emerald-800 border-emerald-200': poll()?.status === 'OPEN',
                      'bg-slate-100 text-slate-600 border-slate-200': poll()?.status === 'CLOSED'
                    }"
                    class="px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap">
                {{ poll()?.status === 'OPEN' ? 'Aberta' : 'Encerrada' }}
              </span>
            </div>
            <p class="text-sm text-slate-500">
              Total de votos computados: <span class="font-bold text-slate-700">{{ totalVotes() }}</span>
            </p>
          </div>

          <!-- Opções de Voto -->
          <div class="p-6 sm:p-8 bg-slate-50">
            <div class="space-y-4">

              <!-- Card de Opção -->
              <button *ngFor="let option of pollService.options()"
                      (click)="handleVote(option.id)"
                      [disabled]="poll()?.status === 'CLOSED' || isVoting()"
                      class="relative w-full text-left overflow-hidden rounded-xl border bg-white p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 group"
                      [ngClass]="{
                        'border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer': poll()?.status === 'OPEN',
                        'border-slate-200 opacity-80 cursor-not-allowed': poll()?.status === 'CLOSED'
                      }">

                <!-- Barra de Progresso (Fundo) -->
                <div class="absolute top-0 left-0 h-full bg-indigo-50 transition-all duration-700 ease-out"
                     [style.width.%]="getPercentage(option.votes)">
                </div>

                <!-- Conteúdo (Frente) -->
                <div class="relative z-10 flex justify-between items-center gap-4">
                  <span class="font-medium text-slate-800 text-lg group-hover:text-indigo-900 transition-colors">
                    {{ option.text }}
                  </span>

                  <div class="flex flex-col items-end shrink-0">
                    <span class="text-base font-bold text-slate-900">
                      {{ getPercentage(option.votes) | number:'1.0-1' }}%
                    </span>
                    <span class="text-xs text-slate-500 font-medium">
                      {{ option.votes }} {{ option.votes === 1 ? 'voto' : 'votos' }}
                    </span>
                  </div>
                </div>
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class PollView implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  public service = inject(PollService);

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

          this.service.loadOptions(result.id).subscribe({
            next: (options) => this.poll.update((prev) => {
              prev!.options = options;
              return prev;
            }),
            error: (err) => console.error("Erro ao carregar os dados iniciais da enquete:", err),
          });

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
