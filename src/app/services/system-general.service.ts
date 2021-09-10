import { EventEmitter, Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CertificateAuthority } from 'app/interfaces/certificate-authority.interface';
import { Certificate } from 'app/interfaces/certificate.interface';
import { Choices } from 'app/interfaces/choices.interface';
import { Option } from 'app/interfaces/option.interface';
import { WebSocketService } from './ws.service';

@Injectable({ providedIn: 'root' })
export class SystemGeneralService {
  protected certificateList: 'certificate.query' = 'certificate.query';
  protected caList: 'certificateauthority.query' = 'certificateauthority.query';

  updateRunning = new EventEmitter<string>();
  updateRunningNoticeSent = new EventEmitter<string>();
  updateIsDone$ = new Subject();

  productType = '';
  getProductType$ = new Observable<string>((observer) => {
    if (!this.productType) {
      this.productType = 'pending';
      this.ws.call('system.product_type').subscribe((res) => {
        this.productType = res;
        observer.next(this.productType);
      });
    } else {
      const wait = setInterval(() => {
        if (this.productType !== 'pending') {
          clearInterval(wait);
          observer.next(this.productType);
        }
      }, 10);
    }
    setTimeout(() => {
      this.productType = '';
    }, 5000);
  });

  constructor(protected ws: WebSocketService) {}

  getCA(): Observable<CertificateAuthority[]> {
    return this.ws.call(this.caList, []);
  }

  getCertificates(): Observable<Certificate[]> {
    return this.ws.call(this.certificateList);
  }

  getUnsignedCertificates(): Observable<Certificate[]> {
    return this.ws.call(this.certificateList, [[['CSR', '!=', null]]]);
  }

  getUnsignedCAs(): Observable<CertificateAuthority[]> {
    return this.ws.call(this.caList, [[['privatekey', '!=', null]]]);
  }

  getCertificateCountryChoices(): Observable<Choices> {
    return this.ws.call('certificate.country_choices');
  }

  ipChoicesv4(): Observable<Option[]> {
    return this.ws.call('system.general.ui_address_choices').pipe(
      map((response) =>
        Object.keys(response || {}).map((key) => ({
          label: response[key],
          value: response[key],
        }))),
    );
  }

  ipChoicesv6(): Observable<Option[]> {
    return this.ws.call('system.general.ui_v6address_choices').pipe(
      map((response) =>
        Object.keys(response || {}).map((key) => ({
          label: response[key],
          value: response[key],
        }))),
    );
  }

  kbdMapChoices(): Observable<Option[]> {
    return this.ws.call('system.general.kbdmap_choices').pipe(
      map((response) =>
        Object.keys(response || {}).map((key) => ({
          label: `${response[key]} (${key})`,
          value: key,
        }))),
    );
  }

  languageChoices(): Observable<Choices> {
    return this.ws.call('system.general.language_choices');
  }

  timezoneChoices(): Observable<Option[]> {
    return this.ws.call('system.general.timezone_choices').pipe(
      map((response) =>
        Object.keys(response || {}).map((key) => ({
          label: response[key],
          value: key,
        }))),
    );
  }

  refreshDirServicesCache(): Observable<void> {
    return this.ws.call('directoryservices.cache_refresh');
  }

  updateDone(): void {
    this.updateIsDone$.next();
  }

  checkRootPW(password: string): Observable<boolean> {
    return this.ws.call('auth.check_user', ['root', password]);
  }
}
