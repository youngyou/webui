import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from 'app/interfaces/app-state.interface';
import { SystemConfigState } from 'app/stores/system-config/system-config.reducer';

export const systemConfigStateKey = 'systemConfig';

export const selectSystemConfigState = createFeatureSelector<AppState, SystemConfigState>(systemConfigStateKey);

export const selectGeneralConfig = createSelector(
  selectSystemConfigState,
  (state) => state.generalConfig,
);
export const selectAdvancedConfig = createSelector(
  selectSystemConfigState,
  (state) => state.advancedConfig,
);
