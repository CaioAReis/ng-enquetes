import { finalize } from "rxjs";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from "@angular/forms";

import { Button } from "../../components/button/button";
import { BackPage } from "../../components/backPage/backPage";
import { CreatePollService } from "./service/create-poll.service";

@Component({
  selector: "app-create-poll",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BackPage, Button],
  template: `
    <div class="sm:px-6 lg:px-8 relative">
      <app-back-page />

      <div class="max-w-3xl mx-auto">
        <div class="flex flex-col gap-1 mb-4">
          <h1 class="text-3xl font-extrabold text-slate-100 tracking-tight">Criar Nova Enquete</h1>
          <p class="text-sm text-slate-400">Preencha os dados abaixo para iniciar uma nova votação.</p>
        </div>

        <form
          [formGroup]="pollForm"
          (ngSubmit)="onSubmit()"
          class="space-y-8 bg-gray-800 text-gray-100 rounded-2xl shadow-sm border border-slate-600 p-6 sm:p-8"
        >
          <div class="flex gap-4">
            <div class="flex flex-1 flex-col gap-1">
              <label
                for="question"
                class="block text-sm font-medium ml-2"
                [ngClass]="{
                  'text-red-400': pollForm.get('question')?.touched && pollForm.get('question')?.invalid,
                  'text-gray-100': !pollForm.get('question')?.touched && !pollForm.get('question')?.invalid,
                }"
              >
                Pergunta da Enquete
              </label>

              <input
                type="text"
                id="question"
                formControlName="question"
                placeholder="Pergunta da Enquete"
                class="shadow-sm w-full sm:text-sm rounded-xl py-2 px-3 border"
                [ngClass]="{
                  'border-red-400 focus:ring-red-400 focus:border-red-500': pollForm.get('question')?.touched && pollForm.get('question')?.invalid,
                  'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500': !pollForm.get('question')?.touched && !pollForm.get('question')?.invalid,
                }"
              >

              @if (pollForm.get('question')?.touched && pollForm.get('question')?.invalid) {
                <p class="text-sm text-red-400">A pergunta é obrigatória.</p>
              }
            </div>

            <div class="flex flex-col gap-1">
              <label for="endDate" class="block text-sm font-medium ml-2">
                Data de Encerramento
              </label>

              <input
                min=""
                id="endDate"
                type="datetime-local"
                formControlName="endDate"
                placeholder="Pergunta da Enquete"
                class="shadow-sm w-full sm:text-sm rounded-xl py-2 px-3 border border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              >
            </div>
          </div>

          <div formArrayName="options">
            <div class="flex items-center justify-between mb-4">
              <label class="block text-base font-medium">Opções de Voto</label>
              <button
                type="button"
                (click)="addOption()"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                + Adicionar Opção
              </button>
            </div>

            <div class="space-y-3">
              @for (option of options.controls; track $index) {
                <div [formGroupName]="$index" class="flex items-center gap-3 mx-4">
                  <div class="flex items-center justify-center text-sm size-7 rounded-full bg-indigo-700 font-medium text-slate-100">
                    {{ $index + 1 }}
                  </div>

                  <input
                    type="text"
                    formControlName="text"
                    placeholder="Descreva a opção"
                    class="flex-1 shadow-sm w-full sm:text-sm rounded-xl py-2 px-3 border border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  <button
                    type="button"
                    class="p-2 transition-colors"
                    (click)="removeOption($index)"
                    [disabled]="options.length <= 2"
                    [ngClass]="options.length <= 2 ? 'text-slate-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              }
            </div>

            @if (options.length <= 2) {
              <p class="mt-2 text-xs text-slate-500">Uma enquete precisa de no mínimo 2 opções.</p>
            }
          </div>

          <div class="pt-5 flex justify-end gap-3">
            <app-button type="submit" [isDisabled]="pollForm.invalid || isLoading()">
              <span>
                @if (isLoading()) { Salvando... }
                @else { Criar Enquete }
              </span>
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreatePoll {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private service = inject(CreatePollService);

  isLoading = signal<boolean>(false);

  pollForm: FormGroup = this.fb.group({
    question: ['', [Validators.required, Validators.minLength(5)]],
    startDate: [this.getDefaultStartDate(), Validators.required],
    endDate: [''],
    status: ['OPEN'],
    options: this.fb.array([
      this.createOptionFormGroup(),
      this.createOptionFormGroup()
    ])
  });

  get options(): FormArray {
    return this.pollForm.get('options') as FormArray;
  }

  private createOptionFormGroup(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required]
    });
  }

  addOption(): void {
    this.options.push(this.createOptionFormGroup());
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    }
  }

  private getDefaultStartDate(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  onSubmit() {
    if (this.pollForm.valid) {
      const body = this.pollForm.value;

      this.isLoading.set(true);
      this.service.create(body)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => console.error('Erro ao criar enquete', err),
      });

    } else this.pollForm.markAllAsTouched();
  }
}
