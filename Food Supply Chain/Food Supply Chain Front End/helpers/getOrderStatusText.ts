import { OrderStatus, OrderStatusText } from "@/enums/order.enum";


export const getOrderStatusText = (status: OrderStatus): string => {
    switch (status) {
        case OrderStatus.ORDERED:
            return OrderStatusText.ORDERED;
        case OrderStatus.ORDER_ACCEPTED:
            return OrderStatusText.ORDER_ACCEPTED;
        case OrderStatus.ORDER_REJECTED:
            return OrderStatusText.ORDER_REJECTED;
        case OrderStatus.ORDER_PREPARED:
            return OrderStatusText.ORDER_PREPARED;
        case OrderStatus.SUBMIT_TO_QA:
            return OrderStatusText.SUBMIT_TO_QA;
        case OrderStatus.QA_APPROVED:
            return OrderStatusText.QA_APPROVED;
        case OrderStatus.QA_FAILED:
            return OrderStatusText.QA_FAILED;
        case OrderStatus.DISPATCH:
            return OrderStatusText.DISPATCH;
        case OrderStatus.DELIVERY_RECEIVED:
            return OrderStatusText.DELIVERY_RECEIVED;
        case OrderStatus.DELIVERY_REJECTED:
            return OrderStatusText.DELIVERY_REJECTED;
        case OrderStatus.ORDER_FULFILLED:
            return OrderStatusText.ORDER_FULFILLED;
        case OrderStatus.PAYMENT_ONHOLD:
            return OrderStatusText.PAYMENT_ONHOLD;
        case OrderStatus.PICKUP_ORDER:
            return OrderStatusText.PICKUP_ORDER;
        case OrderStatus.ORDER_DELIVERED:
            return OrderStatusText.ORDER_DELIVERED;
        default:
            return "";
    }
};
