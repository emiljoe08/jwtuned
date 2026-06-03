import { toDb, fromDb } from './App';

describe('Database Mappers', () => {
  const mockForm = {
    customerName: 'John Doe',
    phone: '9876543210',
    address: '123 Main St',
    regNumber: 'KL-01-A-1234',
    makeModel: 'Toyota Swift',
    year: '2020',
    fuel: 'Petrol',
    odometer: '15000',
    complaint: 'Oil change and general service',
    mechanic: 'Mike',
    deliveryTime: 'Today 5PM',
    status: 'Waiting',
    photos: [{ id: 1, url: 'http://example.com/photo.jpg' }]
  };

  const mockDbRow = {
    id: 'JW-2024-0001',
    customer_name: 'John Doe',
    phone: '9876543210',
    address: '123 Main St',
    vehicle_type: '4W',
    reg_number: 'KL-01-A-1234',
    make_model: 'Toyota Swift',
    year: '2020',
    fuel: 'Petrol',
    odometer: '15000',
    complaint: 'Oil change and general service',
    mechanic: 'Mike',
    delivery_time: 'Today 5PM',
    status: 'Waiting',
    photos: [{ id: 1, url: 'http://example.com/photo.jpg' }]
  };

  describe('toDb()', () => {
    it('should map camelCase form data to snake_case database schema correctly', () => {
      const result = toDb(mockForm, '4W', 'JW-2024-0001');
      expect(result).toEqual(mockDbRow);
    });

    it('should fallback to an empty array if photos are missing', () => {
      const formWithoutPhotos = { ...mockForm, photos: undefined };
      const result = toDb(formWithoutPhotos, '2W', 'JW-2024-0002');
      
      expect(result.photos).toEqual([]);
      expect(result.vehicle_type).toBe('2W');
    });
  });

  describe('fromDb()', () => {
    it('should map snake_case database schema back to camelCase form data correctly', () => {
      const result = fromDb(mockDbRow);
      // fromDb includes the id and vehicleType which were stored natively on the form state in the app
      const expectedForm = { ...mockForm, id: 'JW-2024-0001', vehicleType: '4W' };
      
      expect(result).toEqual(expectedForm);
    });

    it('should fallback to an empty array if photos are missing from the database', () => {
      const dbRowWithoutPhotos = { ...mockDbRow, photos: null };
      const result = fromDb(dbRowWithoutPhotos);
      
      expect(result.photos).toEqual([]);
    });
  });

  describe('Round-trip Mapping', () => {
    it('should retain all data when mapping from form -> DB -> form', () => {
      const dbRow = toDb(mockForm, '4W', 'JW-2024-0001');
      const reconstructedForm = fromDb(dbRow);

      expect(reconstructedForm).toEqual({ ...mockForm, id: 'JW-2024-0001', vehicleType: '4W' });
    });
  });
});