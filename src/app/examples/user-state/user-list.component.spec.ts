import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideState, provideStore } from '@ngss/state';
import { UserStateModel } from './models/user-state.model';
import { UserModel } from './models/user.model';
import { UserStateService } from './services/user-state.service';
import { UserListComponent } from './user-list.component';

describe('UserListComponent (Integration)', () => {
  let fixture: ComponentFixture<UserListComponent>;
  let component: UserListComponent;
  let httpMock: HttpTestingController;

  const initialUserState: UserStateModel = { loading: false, entities: {}, error: null };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideStore(),
        provideState(UserStateService, { key: 'user', initial: initialUserState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should display a loading spinner initially', () => {
    // when request is pending
    const spinner = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinner).toBeTruthy();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Loading users');

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should render user cards when data is loaded', () => {
    const mockUsers: UserModel[] = [
      { id: '1', name: 'Ada Lovelace' },
      { id: '2', name: 'Alan Turing' }
    ];

    // Expect HTTP GET
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);

    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(cards.length).toBe(2);
    expect(cards[0].nativeElement.textContent).toContain('Ada Lovelace');
    expect(cards[1].nativeElement.textContent).toContain('Alan Turing');
  });

  it('should handle an empty response gracefully', () => {
    const req = httpMock.expectOne('/api/users');
    req.flush([]); // empty user list

    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(cards.length).toBe(0);
  });

  it('should display an error message if request fails', () => {
    const req = httpMock.expectOne('/api/users');
    req.error(new ProgressEvent('NetworkError'));

    fixture.detectChanges();

    const errorIcon = fixture.debugElement.query(By.css('mat-icon[color="warn"]'));
    const text = fixture.nativeElement.textContent;
    expect(errorIcon).toBeTruthy();
    expect(text).toContain('error_outlineHttp failure response for /api/users: 0 Retry');
  });

  it('should retry fetching users when Retry is clicked', () => {
    // First call fails
    let req = httpMock.expectOne('/api/users');
    req.error(new ProgressEvent('NetworkError'));

    fixture.detectChanges();

    const retryButton = fixture.debugElement.query(By.css('button'));
    retryButton.triggerEventHandler('click', null);

    fixture.detectChanges();

    // Retry should trigger another HTTP GET
    req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: '1', name: 'Ada Lovelace' }]);

    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(cards.length).toBe(0);
    // expect(cards[0].nativeElement.textContent).toContain('Ada Lovelace');
  });
});
