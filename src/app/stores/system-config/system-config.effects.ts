import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, forkJoin } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { WebSocketService } from 'app/services';
import { adminAppInitialized } from 'app/stores/application/application.actions';
import { systemConfigLoaded } from 'app/stores/system-config/system-config.actions';

@Injectable()
export class SystemConfigEffects {
  loadConfig$ = createEffect(() => this.actions$.pipe(
    ofType(adminAppInitialized),
    mergeMap(() => {
      return forkJoin([
        this.ws.call('system.general.config'),
        this.ws.call('system.advanced.config'),
      ]).pipe(
        map(([generalConfig, advancedConfig]) => systemConfigLoaded({ generalConfig, advancedConfig })),
        catchError(() => {
          // TODO: Basically a fatal error. Handle it.
          return EMPTY;
        }),
      );
    }),
  ));

  constructor(
    private actions$: Actions,
    private ws: WebSocketService,
  ) {}
}
