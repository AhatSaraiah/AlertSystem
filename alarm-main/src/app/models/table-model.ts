export class TableModel {
  public carId?: string;
  public driverName?: string;
  public insuranceDate: Date;
  public testDate: Date;
  public riskMatDate: Date;
  public weight: Date;
  public category?: string;
  public status?: string;
  public note?: string;
  public editFieldName?: string;
  public isComingSoon ?: boolean;
  public isExpired?: boolean;
  constructor() {
    Object.assign(this, {}, {});
    this.isComingSoon=false;
    this.insuranceDate=new Date();
    this.testDate=new Date();
    this.riskMatDate=new Date();
    this.weight=new Date();

  }
}

