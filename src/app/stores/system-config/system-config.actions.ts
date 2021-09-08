import { createAction, props } from '@ngrx/store';
import { AdvancedConfig } from 'app/interfaces/advanced-config.interface';
import { SystemGeneralConfig } from 'app/interfaces/system-config.interface';

export const systemConfigLoaded = createAction(
  '[System Config] Loaded',
  props<{ generalConfig: SystemGeneralConfig; advancedConfig: AdvancedConfig }>(),
);
