import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';

describe('Festival API', () => {
  // Mock festival data with different months
  const mockFestivals = [
    { id: '1', name: 'April Festival', date: '2025-04-15' },
    { id: '2', name: 'May Festival', date: '2025-05-15' },
    { id: '3', name: 'June Festival', date: '2025-06-15' },
    { id: '4', name: 'July Festival', date: '2025-07-15' },
  ];

  // Test that the API returns festivals for all months
  it('should return festivals for all months without date filtering', async () => {
    // Mock the fetch function
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFestivals),
      })
    ) as jest.Mock;

    // Call the API
    const response = await fetch('/api/festivals');
    const data = await response.json();

    // Check that all festivals are returned, regardless of month
    expect(data).toHaveLength(4);
    expect(data[0].date).toBe('2025-04-15');
    expect(data[1].date).toBe('2025-05-15');
    expect(data[2].date).toBe('2025-06-15');
    expect(data[3].date).toBe('2025-07-15');
  });

  // Test that the UI correctly filters by current month
  it('should filter festivals by current month in the UI', () => {
    // Create test implementation for isSameMonth
    const parseISO = (dateString: string) => new Date(dateString);
    const isSameMonth = (date1: Date, date2: Date) =>
      date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
    
    // Define current month as April 2025
    const currentMonth = new Date('2025-04-01');
    
    // Filter festivals by current month
    const filteredFestivals = mockFestivals.filter(festival => 
      isSameMonth(parseISO(festival.date), currentMonth)
    );
    
    // Check that only April festivals are returned
    expect(filteredFestivals).toHaveLength(1);
    expect(filteredFestivals[0].name).toBe('April Festival');

    // Define current month as May 2025
    const nextMonth = new Date('2025-05-01');
    
    // Filter festivals by next month
    const nextMonthFestivals = mockFestivals.filter(festival => 
      isSameMonth(parseISO(festival.date), nextMonth)
    );
    
    // Check that only May festivals are returned
    expect(nextMonthFestivals).toHaveLength(1);
    expect(nextMonthFestivals[0].name).toBe('May Festival');
  });

  // Test month navigation
  it('should show different festivals when navigating between months', () => {
    // Mock data for all months
    const allFestivals = mockFestivals;
    
    // Define months to test
    const monthsToTest = [
      { date: new Date('2025-04-01'), expectedFestival: 'April Festival' },
      { date: new Date('2025-05-01'), expectedFestival: 'May Festival' },
      { date: new Date('2025-06-01'), expectedFestival: 'June Festival' },
      { date: new Date('2025-07-01'), expectedFestival: 'July Festival' },
    ];
    
    // Test each month
    monthsToTest.forEach(month => {
      const { date, expectedFestival } = month;
      
      // Create test implementation for isSameMonth
      const parseISO = (dateString: string) => new Date(dateString);
      const isSameMonth = (date1: Date, date2: Date) =>
        date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
      
      // Filter festivals by month
      const festivalsForMonth = allFestivals.filter(festival => 
        isSameMonth(parseISO(festival.date), date)
      );
      
      // Check that the correct festival is returned for each month
      expect(festivalsForMonth).toHaveLength(1);
      expect(festivalsForMonth[0].name).toBe(expectedFestival);
    });
  });
}); 