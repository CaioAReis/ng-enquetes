import { Router } from "@angular/router";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

@Component({
  selector: "app-back-page",
  imports: [],
  template: `
    <button
      (click)="goBack()"
      class="text-lg absolute left-6 hover:bg-indigo-800/30 -top-12 cursor-pointer border-2 px-6 py-2 rounded-full font-medium text-indigo-600 hover:text-indigo-500 flex items-center transition-colors"
    >
      <span>Voltar</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackPage {
  private router = inject(Router);

  goBack() {
    this.router.navigate(["/"]);
  }
}
