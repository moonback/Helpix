import React from 'react';
import PaymentNotification from './PaymentNotification';
import { usePaymentNotifications } from '@/hooks/usePaymentNotifications';

const PaymentNotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = usePaymentNotifications();

  return (
    <>
      {notifications.map((notification) => (
        <PaymentNotification
          key={notification.id}
          isVisible={true}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
          autoClose={true}
          duration={6000}
        />
      ))}
    </>
  );
};

export default PaymentNotificationContainer;
