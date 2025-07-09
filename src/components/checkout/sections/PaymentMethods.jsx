import Image from 'next/image';

// Payment methods data
export const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', icon: <Image src="/payment/cash-on-delivery.svg" width={24} height={24} alt="Cash on Delivery" /> },
  { id: 'bkash', name: 'bKash', icon: <Image src="/payment/bkash.svg" width={24} height={24} alt="bKash" /> },
  { id: 'nagad', name: 'Nagad', icon: <Image src="/payment/nagad.svg" width={24} height={24} alt="Nagad" /> }
]; 