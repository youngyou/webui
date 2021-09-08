import { Pipe, PipeTransform } from '@angular/core';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { format, utcToZonedTime } from 'date-fns-tz';
import { AppState } from 'app/interfaces/app-state.interface';
import { selectGeneralConfig } from 'app/stores/system-config/system-config.selectors';

@UntilDestroy()
@Pipe({
  name: 'formatDateTime',
  pure: false,
})
export class FormatDateTimePipe implements PipeTransform {
  timeZone: string;
  dateFormat = 'yyyy-MM-dd';
  timeFormat = 'HH:mm:ss';

  constructor(private store$: Store<AppState>) {
    this.store$.select(selectGeneralConfig).pipe(untilDestroyed(this)).subscribe((config) => {
      this.timeZone = config.timezone;
    });
  }

  transform(value: Date | number, args?: string): string {
    return this.formatDateTime(value, args);
  }

  formatDateTime(date: Date | number, tz?: string): string {
    if (tz) {
      date = utcToZonedTime(date.valueOf(), tz);
    } else if (this.timeZone) {
      date = utcToZonedTime(date.valueOf(), this.timeZone);
    }

    return format(date, `${this.dateFormat} ${this.timeFormat}`);
  }
}
