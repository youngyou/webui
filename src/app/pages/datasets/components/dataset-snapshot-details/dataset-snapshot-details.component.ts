import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DatasetInTree } from 'app/pages/datasets/store/dataset-in-tree.interface';
import { WebSocketService } from 'app/services';

@UntilDestroy()
@Component({
  selector: 'ix-dataset-snapshot-details',
  templateUrl: './dataset-snapshot-details.component.html',
  styleUrls: ['./dataset-snapshot-details.component.scss'],
})
export class DatasetSnapshotDetailsComponent implements OnInit {
  @Input() dataset: DatasetInTree;

  constructor(
    private ws: WebSocketService,
  ) { }

  ngOnInit(): void {
    this.ws.call('pool.dataset.summary', [this.dataset.id])
      .pipe(untilDestroyed(this))
      .subscribe(() => {
      });
  }
}
