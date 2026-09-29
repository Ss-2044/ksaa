export const CONDITIONS = {
  NEW: "جديد",
  LIKE_NEW: "أخو الجديد",
  GOOD: "جيد",
} as const;
export type Condition = keyof typeof CONDITIONS;

// "لا يعمل" تظهر للبائع كخيار لكنها مرفوضة — المنصة لا تقبل السلع المتعطلة
export const BROKEN_CONDITION = "BROKEN";
export const BROKEN_WARNING = "المنصة لا تقبل عرض السلع المتعطلة أو التي لا يُنتفع منها";

export const ORDER_STATUS = {
  PENDING_PAYMENT: "بانتظار الدفع",
  NEW: "جديد",
  SHIPPING: "يتم التوصيل",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
} as const;
export type OrderStatus = keyof typeof ORDER_STATUS;

// الحالات التي يتعامل معها المسؤول في صفحة إدارة الطلبات
export const ADMIN_ORDER_STATUSES = ["NEW", "SHIPPING", "DELIVERED"] as const;

export const PAYMENT_METHODS = {
  applepay: "Apple Pay",
  creditcard: "بطاقة مدى / بطاقة ائتمانية",
} as const;
export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export const GENDERS = { MALE: "ذكر", FEMALE: "أنثى" } as const;
export type Gender = keyof typeof GENDERS;

export const DESCRIPTION_MAX = 300;
export const MAX_IMAGES = 10;
export const RESERVATION_MINUTES = 20;
