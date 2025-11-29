import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CurrencyService } from './service/currency.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let currencyService: jasmine.SpyObj<CurrencyService>;

  beforeEach(async () => {
    const currencySpy = jasmine.createSpyObj('CurrencyService', ['setCurrency']);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: CurrencyService, useValue: currencySpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('default selectedCurrency should be "INR"', () => {
    expect(component.selectedCurrency).toBe('INR');
  });

  it('should call currencyService.setCurrency when sendCurrency is called', () => {
    const testCurrency = 'USD';

    component.sendCurrency(testCurrency);

    expect(currencyService.setCurrency).toHaveBeenCalledWith(testCurrency);
    expect(currencyService.setCurrency).toHaveBeenCalledTimes(1);
  });
});
