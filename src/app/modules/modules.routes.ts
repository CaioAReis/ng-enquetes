import { Routes } from '@angular/router';
import { Home } from './home/home';
import { CreatePoll } from './create-poll/create-poll';
import { PollView } from './poll-view/poll-view';

export const MODULES_ROUTES: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: Home,
      },
      {
        path: "create",
        component: CreatePoll,
      },
      {
        path: "poll/:id",
        component: PollView,
      },
      {
        path: "**",
        redirectTo: "",
      },
    ],
  },
];
