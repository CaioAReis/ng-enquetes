import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        loadChildren: () => import("./modules/modules.routes").then((r) => r.MODULES_ROUTES),
      },
      {
        path: "",
        redirectTo: "remote-entry",
        pathMatch: "full",
      },
    ],
  },
];
