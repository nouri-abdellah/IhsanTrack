export const ASSOCIATION_LOCATIONS = [
  "الجزائر",
  "وهران",
  "قسنطينة",
  "عنابة",
  "سطيف",
  "باتنة",
  "بليدة",
  "بجاية",
  "تلمسان",
  "سيدي بلعباس",
  "ورقلة",
  "بسكرة",
  "غرداية",
  "الشلف",
  "مستغانم",
  "المدية",
  "تيزي وزو",
  "تيارت",
  "غليزان",
  "الأغواط",
  "قالمة",
  "برج بوعريريج",
  "سوق أهراس",
  "الطارف",
  "بومرداس",
  "تيسمسيلت",
  "عين الدفلى",
  "المسيلة",
  "بشار",
  "أدرار",
  "جيجل",
  "سكيكدة",
  "البويرة",
  "خنشلة",
  "أم البواقي",
  "تبسة",
  "عين تموشنت",
  "المغير",
  "المنيعة",
  "تمنراست",
  "الوادي",
  "نعامة",
  "سعيدة",
  "ميلة",
  "البيض",
  "تندوف",
  "خميس مليانة",
  "عين صالح",
  "عين قزام"
];

export const ASSOCIATION_FIELDS = [
  { id: "relief", label: "إغاثة عاجلة" },
  { id: "education", label: "تعليم" },
  { id: "health", label: "صحة" },
  { id: "orphans", label: "رعاية الأيتام" },
  { id: "ramadan", label: "قفة رمضان" },
  { id: "food", label: "سلال غذائية" },
  { id: "winter", label: "كسوة الشتاء" },
  { id: "medical", label: "حملات طبية" },
  { id: "shelter", label: "إيواء وسكن" },
  { id: "community", label: "تنمية مجتمعية" },
];

export const fieldLabelById = Object.fromEntries(
  ASSOCIATION_FIELDS.map((field) => [field.id, field.label])
);

export function mapAssociationFields(values) {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => String(value || "").trim())
    .filter((value) => ASSOCIATION_FIELDS.some((field) => field.id === value));
}
