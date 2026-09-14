export const users = [
    {
        id: 101,
        name: 'Christopher Emma',
        phone: '08022156781',
        email: 'chris@gmail.com',
        role: 'user',
        currentLocation: {
            lat: 12.9716, 
            lng: 77.5946
        }
    }
]

export const drivers = [
    {
        id: 1,
        name: "Ramesh Kumar",
        phone: "9988776655",
        role: "driver",
        rating: 4.5,
        available: true,
        currentLocation: { lat: 9.0643, lng: 7.4892 },
        car: {
        model: "Hyundai Creta",
        type: "SUV",
        plateNumber: "KA01AB1234",
        pricePerKm: 15,
        seats: 5,
        }
  }
]





export const requests = [
  {
    id: 1,
    userId: 101,
    driverId: 2,
    pickupLocation: { address: "Koramangala, Bangalore", lat: 12.9352, lng: 77.6146 },
    dropoffLocation: { address: "Whitefield, Bangalore", lat: 12.9698, lng: 77.7500 },
    status: "pending", // pending | accepted | declined | completed
    requestedAt: "2026-09-03T10:15:00Z",
    fareEstimate: 350,
  },
];