const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pages = {
  "index.html": { page: "home", title: "الرئيسية", nav: "home" },
  "products.html": { page: "products", title: "المنتجات", nav: "products" },
  "contact.html": { page: "contact", title: "التواصل", nav: "contact" },
  "cart.html": { page: "cart", title: "السلة", nav: null },
  "checkout.html": { page: "checkout", title: "إتمام الطلب", nav: null },
  "order.html": { page: "order", title: "تأكيد الطلب", nav: null },
  "product.html": { page: "product", title: "المنتج", nav: null },
};

function navBlock(active) {
  const activeClass = (key) => (active === key ? ' class="active"' : "");
  return `<ul class="nav-links">
          <li><a${activeClass("home")} href="index.html" data-page-link="home">الرئيسية</a></li>
          <li><a data-page-link="products"${activeClass("products")} href="products.html">المنتجات</a></li>
          <li><a data-page-link="contact"${activeClass("contact")} href="contact.html">التواصل</a></li>
        </ul>`;
}

for (const [file, meta] of Object.entries(pages)) {
  const filePath = path.join(root, file);
  let content = fs.readFileSync(filePath, "utf8");
  content = content.replace(/<body[^>]*>/, `<body data-page="${meta.page}">`);
  content = content.replace(/<title[^>]*>[\s\S]*?<\/title>/, `<title data-page-title>${meta.title} | BEST LAPTOP</title>`);
  content = content.replace(/<ul class="nav-links">[\s\S]*?<\/ul>/, navBlock(meta.nav));
  content = content.replace(/الصفحة الرئيسية/g, "الرئيسية");
  content = content.replace(/صفحة المنتجات/g, "المنتجات");
  content = content.replace(/صفحة التواصل/g, "التواصل");
  content = content.replace(/العودة لصفحة المنتجات/g, "العودة للمنتجات");
  content = content.replace(/ \| واي كمباني/g, " | BEST LAPTOP");
  content = content.replace(/واي كمباني/g, "BEST LAPTOP");
  content = content.replace(
    /<script src="js\/theme\.js"><\/script>`n    <script src="js\/routes\.js\?v=1"><\/script>/,
    '<script src="js/theme.js"></script>\n    <script src="js/routes.js?v=1"></script>'
  );
  if (!content.includes("routes.js")) {
    content = content.replace(
      '<script src="js/theme.js"></script>',
      '<script src="js/theme.js"></script>\n    <script src="js/routes.js?v=1"></script>'
    );
  }
  content = content.replace(/js\/app\.js\?v=\d+/g, "js/app.js?v=64");
  fs.writeFileSync(filePath, content, "utf8");
}

console.log("HTML pages updated");
