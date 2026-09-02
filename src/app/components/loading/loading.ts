import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-loading",
  imports: [],
  template: `
    <div class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full size-20 border-b-4 border-white"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {}
