import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table/table.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

const routes: Routes = [
  { path: '', component: TableComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes),CommonModule,FormsModule
  ],
  exports: [RouterModule],

})
export class AppRoutingModule { }

export class MyComponentModule { }
