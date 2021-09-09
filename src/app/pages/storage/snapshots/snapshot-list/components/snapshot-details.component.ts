import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { AppState } from 'app/interfaces/app-state.interface';
import { Option } from 'app/interfaces/option.interface';
import { ZfsSnapshot } from 'app/interfaces/zfs-snapshot.interface';
import {
  EntityAction,
  EntityRowDetails,
} from 'app/pages/common/entity/entity-table/entity-row-details.interface';
import { EntityTableComponent } from 'app/pages/common/entity/entity-table/entity-table.component';
import { WebSocketService, StorageService } from 'app/services';
import { LocaleService } from 'app/services/locale.service';
import { selectGeneralConfig } from 'app/stores/system-config/system-config.selectors';
import { SnapshotListComponent } from '../snapshot-list.component';

@UntilDestroy()
@Component({
  selector: 'app-snapshot-details',
  template: `
    <app-entity-row-details [conf]="this"></app-entity-row-details>
  `,
})
export class SnapshotDetailsComponent implements EntityRowDetails<{ name: string }>, OnInit {
  readonly entityName: 'snapshot';
  // public locale: string;
  timezone: string;

  @Input() config: { name: string };
  @Input() parent: EntityTableComponent & { conf: SnapshotListComponent };

  details: Option[] = [];
  actions: EntityAction[] = [];

  constructor(
    private ws: WebSocketService,
    private router: Router,
    private localeService: LocaleService,
    protected storageService: StorageService,
    private store$: Store<AppState>,
  ) {}

  ngOnInit(): void {
    this.store$.select(selectGeneralConfig).pipe(untilDestroyed(this)).subscribe((config) => {
      this.timezone = config.timezone;
      this.ws
        .call('zfs.snapshot.query', [[['id', '=', this.config.name]]])
        .pipe(
          map((response) => ({
            ...response[0].properties,
            name: this.config.name,
            creation: this.localeService.formatDateTime(response[0].properties.creation.parsed.$date, this.timezone),
          })),
          untilDestroyed(this),
        ).subscribe((snapshot: ZfsSnapshot['properties'] & { name: string; creation: string }) => {
          this.details = [
            {
              label: 'Date created',
              value: snapshot.creation,
            },
            {
              label: 'Used',
              value: this.storageService.convertBytestoHumanReadable(snapshot.used.rawvalue),
            },
            {
              label: 'Referenced',
              value: this.storageService.convertBytestoHumanReadable(snapshot.referenced.rawvalue),
            },
          ];
        });
    });

    this.actions = this.parent.conf.getActions() as EntityAction[];
  }
}
