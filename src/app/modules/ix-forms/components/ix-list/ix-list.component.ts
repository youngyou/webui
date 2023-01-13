import {
  Component, EventEmitter, Input, OnInit, Output,
} from '@angular/core';
import { ChartSchemaNode } from 'app/interfaces/chart-release.interface';

@Component({
  selector: 'ix-list',
  templateUrl: './ix-list.component.html',
  styleUrls: ['./ix-list.component.scss'],
})
export class IxListComponent implements OnInit {
  @Input() label: string;
  @Input() tooltip: string;
  @Input() empty: boolean;
  @Input() required: boolean;
  @Input() canAdd = true;
  @Input() default: unknown[];
  @Input() itemsSchema: ChartSchemaNode[];

  @Output() add = new EventEmitter<unknown[]>();

  ngOnInit(): void {
    setTimeout(() => this.handleListDefaults());
  }

  addItem(schema?: unknown[]): void {
    this.add.emit(schema);
  }

  isDisabled = false;

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  private handleListDefaults(): void {
    if (this.default?.length > 0) {
      this.default.forEach((defaultValue: never) => {
        this.addItem(
          this.itemsSchema.map((item: ChartSchemaNode) => {
            return {
              ...item,
              schema: {
                ...item.schema,
                default: defaultValue?.[item.variable] ?? (typeof defaultValue !== 'object' ? defaultValue : item.schema.default),
              },
            };
          }),
        );
      });
    }
  }
}
