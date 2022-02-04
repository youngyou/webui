import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { IpmiSel } from 'app/interfaces/ipmi-sel.interface';
import { EntityUtils } from 'app/modules/entity/utils';
import { DialogService, WebSocketService } from 'app/services';
import { IxSlideInService } from 'app/services/ix-slide-in.service';

@UntilDestroy()
@Component({
  templateUrl: './ipmi-sel-form.component.html',
  styleUrls: ['./ipmi-sel-form.component.scss'],
})
export class IpmiSelFormComponent implements OnInit {
  isFormLoading = false;
  ipmiSelItems: IpmiSel[];

  constructor(
    protected ws: WebSocketService,
    private modal: IxSlideInService,
    private dialogService: DialogService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.ws.call('ipmi.query_sel').pipe(
      untilDestroyed(this),
    ).subscribe(ipmiSelItems => {
      this.ipmiSelItems = ipmiSelItems;
    });
  }

  onClearAll(): void {
    this.isFormLoading = true;
    this.ws.call('ipmi.clear_sel').pipe(
      untilDestroyed(this),
    ).subscribe(() => {
      this.isFormLoading = false;
      this.modal.close();
      this.dialogService.generalDialog({
        title: this.translate.instant('IPMI System Event Log'),
        icon: 'info',
        is_html: true,
        message: this.translate.instant('Successfully removed all records from IPMI system event log.'),
        hideCancel: true,
      })
    }, (error) => {
      this.isFormLoading = false;
      new EntityUtils().handleWsError(this, error, this.dialogService);
    });
  }
}
