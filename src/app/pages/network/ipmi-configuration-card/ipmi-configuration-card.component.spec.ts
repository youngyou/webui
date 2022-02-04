import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { mockCall, mockWebsocket } from 'app/core/testing/utils/mock-websocket.utils';
import { Ipmi } from 'app/interfaces/ipmi.interface';
import { EntityModule } from 'app/modules/entity/entity.module';
import { IxTableModule } from 'app/modules/ix-tables/ix-table.module';
import { IxTableHarness } from 'app/modules/ix-tables/testing/ix-table.harness';
import { IpmiFormComponent } from 'app/pages/network/forms/ipmi-form.component';
import { IpmiConfigurationCardComponent } from 'app/pages/network/ipmi-configuration-card/ipmi-configuration-card.component';
import { DialogService, ModalService } from 'app/services';
import { WebSocketService } from 'app/services/ws.service';

const fakeDataSource: Ipmi[] = [
  {
    id: 2,
    channel: 2,
  } as any,
  {
    id: 1,
    channel: 1,
  } as any,
  {
    id: 0,
    channel: 0,
  } as any,
];

describe('IpmiConfigurationCardComponent', () => {
  let spectator: Spectator<IpmiConfigurationCardComponent>;
  let loader: HarnessLoader;
  let ws: WebSocketService;
  let modalService: ModalService;

  const createComponent = createComponentFactory({
    component: IpmiConfigurationCardComponent,
    imports: [
      EntityModule,
      IxTableModule,
    ],
    providers: [
      mockWebsocket([
        mockCall('ipmi.query', fakeDataSource),
      ]),
      mockProvider(DialogService, {
        confirm: jest.fn(() => of(true)),
      }),
      mockProvider(ModalService, {
        openInSlideIn: jest.fn(),
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    ws = spectator.inject(WebSocketService);
    modalService = spectator.inject(ModalService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show table rows', async () => {
    const table = await loader.getHarness(IxTableHarness);
    const cells = await table.getCells(false);

    const expectedRows = [
      ['Channel 2', ['highlight', 'launch'].join('')],
      ['Channel 1', ['highlight', 'launch'].join('')],
      ['Channel 0', ['highlight', 'launch'].join('')],
    ];

    expect(ws.call).toHaveBeenCalledWith('ipmi.query');
    expect(cells).toEqual(expectedRows);
  });

  it('should show empty message when loaded and datasource is empty', async () => {
    spectator.fixture.componentInstance.loading = false;
    spectator.fixture.componentInstance.error = false;
    spectator.fixture.componentInstance.createDataSource();
    spectator.detectComponentChanges();

    const table = await loader.getHarness<IxTableHarness>(IxTableHarness);
    const text = await table.getCellTextByIndex();

    expect(text).toEqual([['Nothing have been added yet']]);
  });

  it('should show error message when can not retrieve data', async () => {
    spectator.fixture.componentInstance.loading = false;
    spectator.fixture.componentInstance.error = true;
    spectator.fixture.componentInstance.createDataSource();
    spectator.detectComponentChanges();

    const table = await loader.getHarness<IxTableHarness>(IxTableHarness);
    const text = await table.getCellTextByIndex();

    expect(text).toEqual([['Can not retrieve data']]);
  });

  it('should open edit ipmi form', () => {
    jest.spyOn(modalService, 'openInSlideIn').mockImplementation();
    spectator.click(spectator.query('.mat-column-channel', { root: true }));

    expect(modalService.openInSlideIn).toHaveBeenCalledWith(IpmiFormComponent, 2);
  });

  it('should open system event log', async () => {
    jest.spyOn(modalService, 'openInSlideIn').mockImplementation();
    const selButton = await loader.getHarness(MatButtonHarness.with({ text: 'System Event Log' }));
    await selButton.click();

    expect(modalService.openInSlideIn).toHaveBeenCalledWith(IpmiFormComponent, 2);
  });
});
