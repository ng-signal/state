declare const jasmine: any;

export const createTestEventListener = (eventBus: any, emitted: any[]) => {
  emitted.length = 0;
  const subscription = eventBus.asObservable().subscribe((event: any) => {
    // Normalize / sanitize fields
    event.id = 'id-removed';
    event.timestamp = 'timestamp-removed';

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.cell)) {
      event.cell = 'cell-guid-removed';
    }

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.behaviorId)) {
      event.behaviorId = 'behavior-id-guid-removed';
    }

    emitted.push(event);
  });

  return () => subscription.unsubscribe();
};
