import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoinListComponent } from './coin-list.component';
import { ApiService } from '../service/api.service';
import { CurrencyService } from '../service/currency.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CoinListComponent', () => {

  let component: CoinListComponent;
  let fixture: ComponentFixture<CoinListComponent>;
  let mockApiService: any;
  let mockCurrencyService: any;
  let router: Router;

  const mockCurrencyData = [
    { id: 'bitcoin', symbol: 'btc', current_price: 20000, price_change_percentage_24h: 2.5, market_cap: 1_000_000 }
  ];

  const mockTrendingData = [
    { id: 'eth', symbol: 'eth', price: 1500 }
  ];

  beforeEach(async () => {
    mockApiService = {
      getCurrency: jasmine.createSpy('getCurrency').and.returnValue(of(mockCurrencyData)),
      getTrendingCurrency: jasmine.createSpy('getTrendingCurrency').and.returnValue(of(mockTrendingData))
    };

    mockCurrencyService = {
      getCurrency: jasmine.createSpy('getCurrency').and.returnValue(of('USD'))
    };

    await TestBed.configureTestingModule({
      declarations: [CoinListComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: CurrencyService, useValue: mockCurrencyService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CoinListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call getAllData, getBannerData and subscribe to currency changes', () => {
    spyOn(component, 'getAllData');
    spyOn(component, 'getBannerData');

    component.ngOnInit();

    expect(component.getAllData).toHaveBeenCalledTimes(2);  // initial + currency change
    expect(component.getBannerData).toHaveBeenCalledTimes(2);
    expect(mockCurrencyService.getCurrency).toHaveBeenCalled();
  });

  it('getAllData should set dataSource with MatTableDataSource', () => {
    component.paginator = {} as MatPaginator;
    component.sort = {} as MatSort;

    component.getAllData();

    expect(mockApiService.getCurrency).toHaveBeenCalled();
    expect(component.dataSource instanceof MatTableDataSource).toBeTrue();
    expect(component.dataSource.data.length).toBe(1);
  });

  it('getBannerData should set bannerData', () => {
    component.getBannerData();

    expect(mockApiService.getTrendingCurrency).toHaveBeenCalled();
    expect(component.bannerData.length).toBe(1);
  });

  it('applyFilter should update datasource filter value', () => {
    component.dataSource = new MatTableDataSource(mockCurrencyData);
    component.paginator = { firstPage: jasmine.createSpy('firstPage') } as any;

    const event = {
      target: { value: 'btc' }
    } as any;

    component.applyFilter(event);

    expect(component.dataSource.filter).toBe('btc');
    expect(component.paginator.firstPage).toHaveBeenCalled();
  });

  it('gotoDetails should navigate to coin-detail/:id', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.gotoDetails({ id: 'bitcoin' });

    expect(navigateSpy).toHaveBeenCalledWith(['coin-detail', 'bitcoin']);
  });

});
