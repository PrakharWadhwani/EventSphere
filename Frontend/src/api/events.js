import mockEvents from '../data/mockEvents.json';

/**
 * Isolated API service layer for events.
 * Currently uses local mock JSON data; can be swapped to backend API endpoints seamlessly.
 */

export const getAllEvents = async () => {
  // Simulate minor network delay for realistic async handling
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEvents);
    }, 100);
  });
};

export const getEventsToday = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const todayEvents = mockEvents.filter((event) => event.isToday);
      resolve(todayEvents);
    }, 100);
  });
};

export const getRecommendedEvents = async (userInterests = []) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!userInterests || userInterests.length === 0) {
        resolve(mockEvents.slice(0, 4));
        return;
      }

      const recommended = mockEvents.filter((event) =>
        event.tags.some((tag) => userInterests.includes(tag))
      );

      // Fallback to top events if no overlap found
      resolve(recommended.length > 0 ? recommended : mockEvents.slice(0, 4));
    }, 100);
  });
};

export const getEventsByCategory = async (category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!category || category === 'All') {
        resolve(mockEvents);
        return;
      }
      const filtered = mockEvents.filter((event) => event.category === category);
      resolve(filtered);
    }, 100);
  });
};
