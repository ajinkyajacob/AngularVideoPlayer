import { NgForOf, NgIf, UpperCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

export interface ActionEvent{
  type: string,
  index:number
}

export interface ActionButton{
    displayValue:string,
    icon:string,
    disable:boolean
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.sass'],
  standalone: true,
  imports: [MatTableModule, UpperCasePipe,NgForOf,NgIf]
})
export class TableComponent {

  public _dataSource: Array<any> = [];
  displayedColumns: string[] = []
  @Input()
  public actionButton: ActionButton[] = [];
  
  @Input()
  public set dataSource(value: Array<any>) {
    if(!value || value.length === 0) return
    this.displayedColumns = Object.keys(value[0])
    if(this.actionButton.length > 0 && !this.displayedColumns.includes('action')) this.displayedColumns.push('action')
    console.log(this.displayedColumns)
    this._dataSource = value;
  }

  @Output() actionButtonClick = new EventEmitter<ActionEvent>()



}
