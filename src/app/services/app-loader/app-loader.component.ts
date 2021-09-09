import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ConsolePanelModalDialog } from 'app/components/common/dialog/console-panel/console-panel-dialog.component';
import { AppState } from 'app/interfaces/app-state.interface';
import { SystemGeneralService } from 'app/services/system-general.service';
import { selectGeneralConfig } from 'app/stores/system-config/system-config.selectors';
import { WebSocketService } from '../ws.service';

@UntilDestroy()
@Component({
  selector: 'app-app-loader',
  templateUrl: './app-loader.component.html',
  styleUrls: ['./app-loader.component.scss'],
})
export class AppLoaderComponent {
  title: string;
  message: string;

  consoleMsg: string;
  consoleMSgList: string[] = [];

  isShowConsole = false;

  consoleDialog: MatDialogRef<ConsolePanelModalDialog>;
  private _consoleSubscription: Subscription;

  constructor(
    public dialogRef: MatDialogRef<AppLoaderComponent>,
    private _dialog: MatDialog,
    private _ws: WebSocketService,
    private sysGeneralService: SystemGeneralService,
    private store$: Store<AppState>,
  ) {
    this.store$.select(selectGeneralConfig)
      .pipe(untilDestroyed(this))
      .subscribe((config) => {
        if (config.ui_consolemsg) {
          this.isShowConsole = true;
          this.dialogRef.updateSize('200px', '248px');
        }
      });
  }

  onOpenConsole(): void {
    this.consoleDialog = this._dialog.open(ConsolePanelModalDialog, {});

    this._consoleSubscription = this.consoleDialog.componentInstance.onEventEmitter
      .pipe(switchMap(() => this._ws.consoleMessages))
      .pipe(untilDestroyed(this)).subscribe((consoleMsg) => {
        this.consoleDialog.componentInstance.consoleMsg = consoleMsg;
      });

    this.consoleDialog.afterClosed().pipe(untilDestroyed(this)).subscribe(() => {
      clearInterval(this.consoleDialog.componentInstance.intervalPing);
      this._consoleSubscription.unsubscribe();
    });
  }
}
