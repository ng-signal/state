import { NavigationService } from './navigation.service';

describe('Service: Navigation', () => {
  let service: NavigationService;

  beforeEach(() => {
    service = new NavigationService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial state as false', () => {
    expect(service.isOpen()).toBeFalse();
  });

  it('should set loading to true when show() is called', () => {
    service.show();
    expect(service.isOpen()).toBeTrue();
  });

  it('should return a readonly signal reference', () => {
    const signalRef = service.isOpen;
    expect(typeof signalRef).toBe('function');
    expect(signalRef()).toBeFalse();
  });
});
