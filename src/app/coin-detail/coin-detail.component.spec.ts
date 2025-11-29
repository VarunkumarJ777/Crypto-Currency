import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoinDetailComponent } from './coin-detail.component';
import { ApiService } from '../service/api.service';
import { CurrencyService } from '../service/currency.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CoinDetailComponent', () => {
  let component: CoinDetailComponent;
  let fixture: ComponentFixture<CoinDetailComponent>;

  let apiServiceMock: any;
  let currencyServiceMock: any;
  let activatedRouteMock: any;

  beforeEach(async () => {
    apiServiceMock = {
      getCurrencyById: jasmine.createSpy('getCurrencyById'),
      getGrpahicalCurrencyData: jasmine.createSpy('getGrpahicalCurrencyData')
    };

    currencyServiceMock = {
      getCurrency: jasmine.createSpy('getCurrency')
    };

    activatedRouteMock = {
      params: of({ id: 'bitcoin' })
    };

    await TestBed.configureTestingModule({
      declarations: [CoinDetailComponent, BaseChartDirective],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
        { provide: CurrencyService, useValue: currencyServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CoinDetailComponent);
    component = fixture.componentInstance;
  });
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load route param coinId on init', () => {
    expect(component.coinId).toBeUndefined();

    currencyServiceMock.getCurrency.and.returnValue(of('INR'));

    apiServiceMock.getCurrencyById.and.returnValue(of({
      market_data: {
        current_price: { inr: 100, usd: 120 },
        market_cap: { inr: 200, usd: 240 }
      }
    }));

    apiServiceMock.getGrpahicalCurrencyData.and.returnValue(of({
      prices: [[12345, 100], [12346, 110]]
    }));

    fixture.detectChanges();

    expect(component.coinId).toBe('bitcoin');
  });

  /* ---------------------- GET COIN DATA ---------------------- */
  it('should fetch coin data and map currency correctly', () => {
    const mockResponse = {
      market_data: {
        current_price: { inr: 100, usd: 120 },
        market_cap: { inr: 200, usd: 240 }
      }
    };

    component.currency = 'USD';
    apiServiceMock.getCurrencyById.and.returnValue(of(mockResponse));

    component.getCoinData();

    expect(apiServiceMock.getCurrencyById).toHaveBeenCalledWith('bitcoin');
    expect(component.coinData.market_data.current_price.inr).toBe(120);  // USD override
    expect(component.coinData.market_data.market_cap.inr).toBe(240);
  });
  it('should update chart data when getGraphData is called', () => {
    const mockGraphData = {
      prices: [
        [1700000000000, 200],
        [1700000005000, 250],
      ]
    };

    apiServiceMock.getGrpahicalCurrencyData.and.returnValue(of(mockGraphData));

    component.myLineChart = {
      chart: {
        update: jasmine.createSpy('update')
      }
    } as any;

    component.getGraphData(7);

    expect(component.days).toBe(7);

    expect(apiServiceMock.getGrpahicalCurrencyData)
      .toHaveBeenCalledWith('bitcoin', component.currency, 7);

    expect(component.lineChartData.datasets[0].data.length).toBe(2);
    expect(component.myLineChart.chart.update).toHaveBeenCalled();
  });

  it('should refetch coin + graph data when currency changes', () => {
    apiServiceMock.getCurrencyById.and.returnValue(of({
      market_data: {
        current_price: { inr: 100, usd: 120 },
        market_cap: { inr: 200, usd: 240 }
      }
    }));

    apiServiceMock.getGrpahicalCurrencyData.and.returnValue(of({
      prices: [[1, 100]]
    }));

    currencyServiceMock.getCurrency.and.returnValue(of('USD'));

    fixture.detectChanges();

    expect(apiServiceMock.getCurrencyById).toHaveBeenCalled();
    expect(apiServiceMock.getGrpahicalCurrencyData).toHaveBeenCalled();
    expect(component.currency).toBe('USD');
  });
});
