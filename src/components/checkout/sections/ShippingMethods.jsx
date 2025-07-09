import Image from 'next/image';

// Bangladesh shipping methods
export const shippingMethods = [
  {
    id: 'dhaka',
    name: 'Inside Dhaka',
    price: 50,
    deliveryTime: '1-2 business days',
    areas: ['Dhaka City']
  },
  {
    id: 'suburban',
    name: 'Dhaka Sub-Urban',
    price: 80,
    deliveryTime: '1-2 business days',
    areas: ['Savar', 'Keraniganj', 'Dohar', 'Tongi', 'Gazipur', 'Narayanganj']
  },
  {
    id: 'outside_dhaka',
    name: 'Outside Dhaka',
    price: 120,
    deliveryTime: '2-3 business days',
    areas: ['All other districts']
  }
]; 