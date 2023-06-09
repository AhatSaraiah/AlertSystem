import {Component, OnInit} from '@angular/core';
import * as XLSX from 'xlsx';
import {TableModel} from "../models/table-model";
import * as FileSaver from 'file-saver';
@Component({
  selector: 'tableComponent',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})

export class TableComponent implements OnInit {
  element_data?: Array<TableModel>;
  data: Array<TableModel>= [];
  isDisable = true;
  sortedData?:Array<TableModel>;

  ngOnInit(): void {
    const dataLocalStorage = localStorage.getItem('tableNew');
    if (dataLocalStorage) {
      this.data = JSON.parse(dataLocalStorage);
      this.onUpdateIsComingSoon();
      this.onUpdateExpired();
    }
  }
  
  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log(input)

    if (input && input.files) {
      const files = input.files;
      const reader = new FileReader();
      reader.onload = () => {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, {type: "array", cellDates: true});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const date_format = 'dd-mm-yyyy';

        this.element_data = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          header: 1,
          dateNF: date_format,
        })
        this.data = this.element_data.map((row: any) => {
          const data = new TableModel();
          data.carId = row[0];
          data.driverName = row[1];
          data.insuranceDate = row[2];
          data.testDate = row[3];
          data.riskMatDate = row[4];
          data.weight = row[5];
          data.category = row[6];
          data.status = row[7];
          data.note = row[8];
          return data;
        });
        localStorage.setItem("tableNew", JSON.stringify(this.data));
        this.onUpdateIsComingSoon();
        this.onUpdateExpired();
      };
      reader.readAsArrayBuffer(files[0]);
    }
  }

  updateLocalStorage(item: any) {
    this.data?.forEach(res =>{
      if(res.carId === item.carId){
        res = item;
        res.editFieldName = '';
      }
    })
    console.log(this.data![0])
    this.onUpdateIsComingSoon();
    this.onUpdateExpired();
    localStorage.setItem("tableNew", JSON.stringify(this.sortedData));
    this.isDisable = true;
  }

  onUpdateIsComingSoon() {
    this.data.sort(this.sortByDate('weight'));
    this.data.sort(this.sortByDate('riskMatDate'));
    this.data.sort(this.sortByDate('insuranceDate'));
    this.sortedData =this.data.sort(this.sortByDate('testDate'));
    // Calculate coming soon status for each row
    this.sortedData?.forEach(row => {
      row.isComingSoon = this.comingSoon(row);
    });

    // Sort the data by coming soon status
    this.sortedData?.sort((a, b) => {
      if (a.isComingSoon && !b.isComingSoon) {
        return -1;
      } else if (!a.isComingSoon && b.isComingSoon) {
        return 1;
      } else {
        return 0;
      }
    });
    this.data=this.sortedData;
  }

  sortByDate(propertyName: string) {
    return (a: any, b: any) => {
      const aDate = new Date(a[propertyName]);
      const bDate = new Date(b[propertyName]);
      if (aDate < bDate) {
        return -1;
      }
      if (aDate > bDate) {
        return 1;
      }
      return 0;
    };
  }

  comingSoon(row: TableModel): boolean {
    const today = new Date().getTime();
    const insuranceDate = new Date(row.insuranceDate).getTime();
    const testDate = new Date(row.testDate).getTime();
    const riskMatDate = new Date(row.riskMatDate).getTime();
    const weightDate = new Date(row.weight).getTime();
    const month = 1000 * 60 * 60 * 24 * 30;
    // Check if testDate is in the past
    if (testDate < today) {
      return false;
    }
    const diffTestDays = testDate - today;
    const diffWeightDays = weightDate - today;
    const diffRiskDays = riskMatDate - today;
    const diffLicenseDays = insuranceDate - today;
  // Check if the difference is less than or equal to 30 days (i.e., coming soon)
    if ((diffTestDays <= month&& diffTestDays>0)||( diffWeightDays <= month && diffWeightDays>0)||(diffRiskDays <= month && diffRiskDays>0) || (diffLicenseDays <= month && diffLicenseDays>0)) 
        return true;
    return false;
  }
  
  onUpdateExpired(){
      const expiredData =this.sortedData?.filter((row) => this.isExpired(row));
      const nonExpiredData =this.sortedData?.filter((row) => !this.isExpired(row));

      expiredData?.forEach(row =>{
          row.status = 'פג תוקף!';
          row.isExpired=true;
      });
      nonExpiredData?.forEach(row =>{
        if(this.comingSoon(row)){
          row.status = 'תאריך יפוג בקרוב!';
        }
      
    });
  }
  
  isExpired(row: TableModel): boolean {
    const currentDate = new Date();
    const insuranceDate = new Date(row.insuranceDate);
    const riskMatDate = new Date(row.riskMatDate);
    const testDate = new Date(row.testDate);
    const weight = new Date(row.weight);
 
    return insuranceDate < currentDate || weight < currentDate || riskMatDate < currentDate || testDate < currentDate;
  }
  
  onEdit(item: any, field: string) {
    item.editFieldName = field;
    this.isDisable = false;
  }

  close(item: any) {
    item.editFieldName = '';
  }

  deleteRow(record: TableModel) {
    const index = this.data.indexOf(record);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }
  addRow() {
    const newRow = new TableModel();
    this.data.push(newRow);
  }

  downloadExcel() {
    if(this.sortedData){
      const worksheet = XLSX.utils.json_to_sheet(this.sortedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      FileSaver.saveAs(data, 'table.xlsx');
    }else {
      console.error('No data to download!');
    }
  }
}
