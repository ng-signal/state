import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideState, provideStore } from '@ngss/state';
import { UserModel } from '../models/user.model';
import { UserStateManualService } from './services/user-state-manual.service';
import { UserListManualComponent } from './user-list-manual.component';

describe('Component: User List Manual', () => {
  let fixture: ComponentFixture<UserListManualComponent>;
  let component: UserListManualComponent;
  let httpMock: HttpTestingController;

  const mockUsers: UserModel[] = [
    { id: '1', name: 'Ada Lovelace' },
    { id: '2', name: 'Alan Turing' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListManualComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideStore(),
        ...provideState(UserStateManualService, { key: 'userManual', initial: null })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListManualComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component and start loading users', () => {
    fixture.detectChanges();

    // The request should have been triggered automatically
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    expect(component).toBeTruthy();

    // Component should be in loading state
    const loading = fixture.debugElement.query(By.css('.loading-state'));
    expect(loading).toBeTruthy();

    // Finish request
    req.flush(mockUsers);
  });

  it('should display users once data is loaded', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/users');
    req.flush(mockUsers);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.user-card'));
    expect(cards.length).toBe(2);
    expect(cards[0].nativeElement.textContent).toContain('Ada Lovelace');
    expect(cards[1].nativeElement.textContent).toContain('Alan Turing');
  });

  it('should display error state when request fails', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/users');
    req.flush('Internal Error', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const errorState = fixture.debugElement.query(By.css('.error-state'));
    expect(errorState).toBeTruthy();
    expect(errorState.nativeElement.textContent).toContain('Server Error');
  });

  it('should retry fetching users when Retry is clicked', () => {
    fixture.detectChanges();

    // Fail the first request
    const req1 = httpMock.expectOne('/api/users');
    req1.flush('Failed', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    // Click Retry button
    const retryButton = fixture.debugElement.query(By.css('button'));
    retryButton.nativeElement.click();
    fixture.detectChanges();

    // Expect a new HTTP request
    const req2 = httpMock.expectOne('/api/users');
    expect(req2.request.method).toBe('GET');

    req2.flush(mockUsers);
    fixture.detectChanges();

    // Should now show the data cards again
    const cards = fixture.debugElement.queryAll(By.css('.user-card'));
    expect(cards.length).toBe(2);
    expect(cards[0].nativeElement.textContent).toContain('Ada Lovelace');
  });

  it('should show loading spinner while fetching users', async () => {
    fixture.detectChanges();

    await fixture.detectChanges();

    const req = httpMock.expectOne('/api/users');

    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(By.css('.loading-state'));
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.nativeElement.textContent).toContain('Loading users (Manual) ...');

    // Complete the request
    req.flush(mockUsers);
    fixture.detectChanges();

    // Spinner should disappear
    const spinnerAfter = fixture.debugElement.query(By.css('.loading-state'));
    expect(spinnerAfter).toBeNull();
  });
});
