import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { TranslateService } from "@ngx-translate/core";
import { Ipmi } from "app/interfaces/ipmi.interface";
import { EmptyConfig, EmptyType } from "app/modules/entity/entity-empty/entity-empty.component";
import { IpmiFormComponent } from "app/pages/network/forms/ipmi-form.component";
import { IpmiSelFormComponent } from "app/pages/network/ipmi-sel-form/ipmi-sel-form.component";
import { WebSocketService, ModalService } from "app/services";
import { IpmiService } from "app/services/ipmi.service";
import { IxSlideInService } from "app/services/ix-slide-in.service";

@UntilDestroy()
@Component({
  selector: 'ipmi-configuration-card',
  templateUrl: './ipmi-configuration-card.component.html',
  styleUrls: ['./ipmi-configuration-card.component.scss'],
})
export class IpmiConfigurationCardComponent implements OnInit {
  dataSource: MatTableDataSource<Ipmi> = new MatTableDataSource([]);
  displayedColumns = [
    'channel',
    'actions',
  ];
  loading = false;
  loadingConf: EmptyConfig = {
    type: EmptyType.Loading,
    large: false,
    title: this.translate.instant('Loading...'),
  };
  emptyConf: EmptyConfig = {
    type: EmptyType.NoPageData,
    large: true,
    title: this.translate.instant('Nothing have been added yet'),
  };
  errorConf: EmptyConfig = {
    type: EmptyType.Errors,
    large: true,
    title: this.translate.instant('Can not retrieve data'),
  };
  error = false;

  get currentEmptyConf(): EmptyConfig {
    if (this.loading) {
      return this.loadingConf;
    }
    if (this.error) {
      return this.errorConf;
    }
    return this.emptyConf;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private ipmiService: IpmiService,
    private modalService: ModalService,
    private slideInService: IxSlideInService,
    private translate: TranslateService,
    private ws: WebSocketService,
  ) { }

  ngOnInit(): void {
    this.getData();

    this.slideInService.onClose$.pipe(
      untilDestroyed(this),
    ).subscribe(() => {
      this.getData();
    });
  }

  createDataSource(data: Ipmi[] = []): void {
    this.dataSource = new MatTableDataSource(data);
  }

  getData(): void {
    this.loading = true;

    this.ws.call('ipmi.query').pipe(
      untilDestroyed(this),
    ).subscribe(data => {
      this.loading = false;
      this.error = false;
      this.createDataSource(data);
      this.cdr.markForCheck();
    }, () => {
      this.loading = false;
      this.error = true;
      this.createDataSource();
      this.cdr.markForCheck();
    });
  }

  add(): void {
    this.slideInService.open(IpmiFormComponent);
  }

  edit(row: Ipmi): void {
    this.modalService.openInSlideIn(IpmiFormComponent, row.id);
  }

  identify(row: Ipmi): void {
    this.ipmiService.showIdentifyDialog();
  }

  manage(row: Ipmi): void {
    window.open(`http://${row.ipaddress}`);
  }

  canManage(row: Ipmi): boolean {
    return row.ipaddress !== '0.0.0.0';
  }

  systemEventLog(): void {
    this.slideInService.open(IpmiSelFormComponent);
  }
}
