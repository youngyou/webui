import { SystemConfigEffects } from 'app/stores/system-config/system-config.effects';
import { systemConfigReducer } from 'app/stores/system-config/system-config.reducer';
import { systemConfigStateKey } from 'app/stores/system-config/system-config.selectors';

export const rootReducers = {
  [systemConfigStateKey]: systemConfigReducer,
};

export const rootEffects = [SystemConfigEffects];
