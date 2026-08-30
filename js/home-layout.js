const HomeLayout = (() => {
  const STATIC_BLOCKS = [
    { id: "hero", type: "hero", label: "بانر الموقع (السلايدر الرئيسي)" },
    { id: "new-products", type: "new-products", label: "أحدث المنتجات" },
    { id: "office-gallery", type: "office-gallery", label: "معرض المكتب" },
    { id: "categories", type: "categories", label: "فئات الاستخدام" },
  ];

  function defaultLayout(sliders = []) {
    const items = [{ id: "hero", type: "hero", label: "بانر الموقع (السلايدر الرئيسي)", active: true }];
    [...sliders]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .forEach((s) => {
        items.push({
          id: `ps-${s.id}`,
          type: "product-slider",
          sliderId: s.id,
          label: s.title || "سلايدر منتجات",
          active: s.active !== false,
        });
      });
    STATIC_BLOCKS.filter((b) => b.id !== "hero").forEach((b) => {
      items.push({ ...b, active: true });
    });
    return items;
  }

  function normalize(saved, sliders = []) {
    const slidersList = Array.isArray(sliders) ? sliders : [];
    if (!Array.isArray(saved) || !saved.length) return defaultLayout(slidersList);

    const sliderIds = new Set(slidersList.map((s) => s.id));
    const staticTypes = new Set(STATIC_BLOCKS.map((b) => b.type));
    const result = [];
    const seen = new Set();

    saved.forEach((item) => {
      if (!item?.id || seen.has(item.id)) return;
      const type = item.type;
      if (type === "product-slider") {
        if (!item.sliderId || !sliderIds.has(item.sliderId)) return;
        result.push({
          id: item.id,
          type,
          sliderId: item.sliderId,
          label: item.label || slidersList.find((s) => s.id === item.sliderId)?.title || "سلايدر منتجات",
          active: item.active !== false,
        });
        seen.add(item.id);
        return;
      }
      if (!staticTypes.has(type)) return;
      const meta = STATIC_BLOCKS.find((b) => b.type === type);
      result.push({
        id: meta?.id || item.id,
        type,
        label: item.label || meta?.label || type,
        active: item.active !== false,
      });
      seen.add(item.id);
    });

    slidersList
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .forEach((s) => {
        const id = `ps-${s.id}`;
        if (seen.has(id)) return;
        result.push({
          id,
          type: "product-slider",
          sliderId: s.id,
          label: s.title || "سلايدر منتجات",
          active: s.active !== false,
        });
        seen.add(id);
      });

    STATIC_BLOCKS.forEach((b) => {
      if (seen.has(b.id)) return;
      result.push({ ...b, active: true });
      seen.add(b.id);
    });

    return result;
  }

  function blockTypeLabel(type) {
    const map = {
      hero: "بانر",
      "product-slider": "سلايدر منتجات",
      "new-products": "أحدث المنتجات",
      "office-gallery": "معرض",
      categories: "فئات",
    };
    return map[type] || type;
  }

  return { STATIC_BLOCKS, defaultLayout, normalize, blockTypeLabel };
})();
