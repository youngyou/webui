import { SystemConfigState } from 'app/stores/system-config/system-config.reducer';
import { systemConfigStateKey } from 'app/stores/system-config/system-config.selectors';

export interface AppState {
  [systemConfigStateKey]: SystemConfigState;
}
