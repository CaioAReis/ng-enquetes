import { Button } from "./components/button/button";
import { Router, RouterOutlet } from '@angular/router';
import { Component, inject, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Button],
  template: `
    <div class="flex flex-col gap-6 p-6 h-[100vh] bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-100">
            Sistema de Enquetes
          </h1>
          <p class="mt-2 text-sm text-slate-400">
            Vote em tempo real ou crie novas perguntas para a comunidade.
          </p>
        </div>

        <app-button (click)="goToCreate()">
          + Nova Enquete
        </app-button>
      </div>

      <router-outlet />
    </div>
  `,
})
export class App {
  private router = inject(Router);

  protected readonly title = signal('Enquetes - Realtime');

  goToCreate() {
    this.router.navigate(['/create']);
  }
}
