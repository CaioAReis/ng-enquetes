import { DatePipe, NgClass } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { Poll } from "../../models/Poll";
import { Router } from "@angular/router";
import { Button } from "../button/button";

@Component({
  selector: 'app-poll-card',
  imports: [NgClass, DatePipe, Button],
  template: `
    <div class="bg-slate-800 rounded-xl shadow-sm border border-slate-600 hover:shadow-md hover:border-slate-400 transition-all duration-200 p-6 flex flex-col justify-between">
      <div class="flex flex-col gap-4">
        <div class="flex justify-between">
          <span
            [ngClass]="{
              'bg-emerald-800 text-emerald-300': poll()?.status === 'OPEN',
              'bg-orange-800 text-orange-300': poll()?.status === 'CLOSED',
            }"
            class="px-2.5 py-1 text-xs font-semibold rounded-full"
          >
            {{ poll()?.status === 'OPEN' ? 'Aberta' : 'Encerrada' }}
          </span>

          <span class="text-xs text-slate-400">
            Criada em: {{ poll()?.startDate | date:'dd/MM/yyyy' }}
          </span>
        </div>

        <h2 class="text-xl font-bold text-slate-200 mb-2 line-clamp-3">
          {{ poll()?.question }}
        </h2>
      </div>

      <app-button (click)="goToPoll(poll()?.id!)" class="flex-1 w-full mt-6">
        {{ poll()?.status === 'OPEN' ? 'Participar da Enquete' : 'Ver Resultados' }}
      </app-button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollCard {
  private router = inject(Router);

  poll = input<Poll | null>(null);

  goToPoll(id: string) {
    this.router.navigate(['/poll', id]);
  }
}
