import { NgClass } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [NgClass],
  template: `
    <button
      (click)="onClick.emit()"
      [disabled]="isDisabled() || isLoading()"
      class="bg-indigo-600 w-full hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
       [ngClass]="{
        'cursor-not-allowed opacity-50 bg-slate-700 hover:bg-slate-500': isDisabled() || isLoading(),
        'cursor-pointer active:translate-y-1 duration-200 ease-in-out transition': !isDisabled(),
      }"
    >
      @if (isLoading()) {
        <div class="animate-spin rounded-full size-6 border-b-2 border-white"></div>
      } @else { <ng-content /> }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  onClick = output<void>();

  isLoading = input<boolean>(false);
  isDisabled = input<boolean>(false);
}
