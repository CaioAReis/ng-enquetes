import { finalize } from "rxjs";
import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";

import { Poll } from "../../models/Poll";
import { HomeService } from "./service/home.service";
import { Loading } from "../../components/loading/loading";
import { PollCard } from "../../components/poll-card/poll-card";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, PollCard, Loading],
  template: `
    <div class="py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        @if (isLoading()) { <app-loading /> }
        @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (poll of polls(); track $index) {
              <app-poll-card [poll]="poll" />
            } @empty {
              <div class="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-gray-800 rounded-xl border border-slate-200 border-dashed">
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
