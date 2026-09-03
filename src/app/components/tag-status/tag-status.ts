import { NgClass } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tag-status',
  imports: [NgClass],
  template: `
    <span
      [ngClass]="{
        'bg-emerald-800 text-emerald-300': status() === 'OPEN',
        'bg-orange-800 text-orange-300': status() === 'CLOSED',
      }"
      class="px-2.5 py-1 text-xs font-semibold rounded-full"
    >
      {{ status() === 'OPEN' ? 'Aberta' : 'Encerrada' }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagStatus {
  status = input.required<"OPEN" | "CLOSED">();
}
