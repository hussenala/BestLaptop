const PRODUCT_CONDITIONS = {
  new: { label: "New", labelAr: "جديد", class: "cond-new" },
  refurbished: { label: "Refurbished", labelAr: "مجدّد", class: "cond-refurbished" },
  "open-box": { label: "Open Box", labelAr: "مفتوح", class: "cond-open-box" },
};

function normalizeProductCondition(value) {
  const raw = String(value || "new").trim().toLowerCase();
  if (raw === "open box" || raw === "open_box" || raw === "openbox") return "open-box";
  if (raw === "refurb" || raw === "refurbished") return "refurbished";
  return PRODUCT_CONDITIONS[raw] ? raw : "new";
}

function productConditionLabel(condition, lang = "en") {
  const key = normalizeProductCondition(condition);
  const meta = PRODUCT_CONDITIONS[key];
  return lang === "ar" ? meta.labelAr : meta.label;
}

function productConditionBadge(condition) {
  const key = normalizeProductCondition(condition);
  const meta = PRODUCT_CONDITIONS[key];
  return `<span class="pc-condition ${meta.class}" data-product-condition="${key}">${meta.label}</span>`;
}

function productConditionOptions(selected = "new") {
  const current = normalizeProductCondition(selected);
  return Object.entries(PRODUCT_CONDITIONS)
    .map(
      ([value, meta]) =>
        `<option value="${value}" ${current === value ? "selected" : ""}>${meta.label} — ${meta.labelAr}</option>`
    )
    .join("");
}

window.PRODUCT_CONDITIONS = PRODUCT_CONDITIONS;
window.normalizeProductCondition = normalizeProductCondition;
window.productConditionLabel = productConditionLabel;
window.productConditionBadge = productConditionBadge;
window.productConditionOptions = productConditionOptions;
