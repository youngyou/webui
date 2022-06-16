import { DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';

export class IxNestedTreeDataSource<T> extends DataSource<T> {
  private dataStream$: BehaviorSubject<T[]>;

  get data(): T[] {
    return this.dataStream$.getValue();
  }

  constructor(data: T[]) {
    super();
    this.dataStream$ = new BehaviorSubject(data);
  }

  connect(): Observable<readonly T[]> {
    return this.dataStream$.asObservable();
  }

  disconnect(): void {}
}
