import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { mockCall, mockWebsocket } from 'app/core/testing/utils/mock-websocket.utils';
import { IpmiSel } from 'app/interfaces/ipmi-sel.interface';
import { IxFormsModule } from 'app/modules/ix-forms/ix-forms.module';
import { FormErrorHandlerService } from 'app/modules/ix-forms/services/form-error-handler.service';
import { IpmiSelFormComponent } from 'app/pages/network/ipmi-sel-form/ipmi-sel-form.component';
import { DialogService, SystemGeneralService, WebSocketService } from 'app/services';
import { IxSlideInService } from 'app/services/ix-slide-in.service';

describe('IpmiSelFormComponent', () => {
  let spectator: Spectator<IpmiSelFormComponent>;
  let loader: HarnessLoader;
  let ws: WebSocketService;
  const mockDevices = [
    {
      sensor: 'sensor1',
      event: 'event1',
      direction: 'direction1',
      verbose: 'verbose1',
      datetime: '2017-02-02T10:01:54.371Z',
    } as IpmiSel,
    {
      sensor: 'sensor2',
      event: 'event2',
      direction: 'direction2',
      verbose: 'verbose2',
      datetime: '2020-03-04T15:07:07.493Z',
    } as IpmiSel,
    {
      sensor: 'sensor3',
      event: 'event3',
      direction: 'direction3',
      verbose: 'verbose3',
      datetime: '2021-05-23T05:05:29.549Z',
    } as IpmiSel,
  ];

  const createComponent = createComponentFactory({
    component: IpmiSelFormComponent,
    imports: [
      IxFormsModule,
      ReactiveFormsModule,
    ],
    providers: [
      mockWebsocket([
        mockCall('ipmi.query_sel', mockDevices),
        mockCall('ipmi.clear_sel'),
      ]),
      mockProvider(SystemGeneralService),
      mockProvider(IxSlideInService),
      mockProvider(FormErrorHandlerService),
      mockProvider(DialogService),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    ws = spectator.inject(WebSocketService);
  });

  it('loads system event logs and shows them', () => {
    const eventsSection = spectator.query('.all-events');
    const eventBlock = eventsSection.querySelectorAll('div');
    expect(eventBlock).toHaveLength(3);

    const eventLine = eventBlock[0].querySelectorAll('li');
    expect(eventLine).toHaveLength(5);
    expect(eventLine[0]).toHaveText('sensor1');
    expect(eventLine[1]).toHaveText('event1');
    expect(eventLine[2]).toHaveText('direction1');
    expect(eventLine[3]).toHaveText('verbose1');
    expect(eventLine[4]).toHaveText('2017-02-02 13:01:54');
  });

  it('clears all logs when "Clear All" button is pressed', async () => {
    const clearButton = await loader.getHarness(MatButtonHarness.with({ text: 'Clear All Events' }));
    await clearButton.click();

    expect(ws.call).toHaveBeenCalledWith('ipmi.clear_sel');
  });
});
