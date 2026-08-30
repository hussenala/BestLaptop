const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function patch(content) {
  return content
    .replace(/href="index\.html"/g, 'href="/"')
    .replace(/href='index\.html'/g, "href='/'")
    .replace(/action="products\.html"/g, 'action="/products"')
    .replace(/href="products\.html"/g, 'href="/products"')
    .replace(/href="contact\.html"/g, 'href="/contact"')
    .replace(/href="cart\.html"/g, 'href="/cart"')
    .replace(/href="checkout\.html"/g, 'href="/checkout"')
    .replace(/href="order\.html"/g, 'href="/order"')
    .replace(/href="product\.html"/g, 'href="/product"')
    .replace(/href="product\.html\?id=\$\{([^}]+)\}"/g, 'href="${productUrl($1)}"')
    .replace(/href='product\.html\?id=\$\{([^}]+)\}'/g, "href='${productUrl($1)}'")
    .replace(/<a href="product\.html\?id=\$\{([^}]+)\}"/g, '<a href="${productUrl($1)}"')
    .replace(/location\.href = `product\.html\?id=\$\{([^`]+)\}`/g, "location.href = productUrl($1)")
    .replace(/location\.href = "products\.html"/g, 'location.href = "/products"')
    .replace(/location\.href = "checkout\.html"/g, 'location.href = "/checkout"')
    .replace(/location\.replace\("order\.html"\)/g, 'location.replace("/order")')
    .replace(/location\.replace\("checkout\.html"\)/g, 'location.replace("/checkout")')
    .replace(/new URL\("cart\.html", window\.location\.href\)/g, 'new URL("/cart", window.location.origin)')
    .replace(/return "cart\.html";/g, 'return "/cart";')
    .replace(/href: "cart\.html"/g, 'href: "/cart"')
    .replace(/href: "checkout\.html"/g, 'href: "/checkout"')
    .replace(/href: "order\.html"/g, 'href: "/order"')
    .replace(/href: "index\.html"/g, 'href: "/"')
    .replace(/href: "products\.html"/g, 'href: "/products"')
    .replace(/href: "contact\.html"/g, 'href: "/contact"')
    .replace(/linkUrl: "products\.html"/g, 'linkUrl: "/products"')
    .replace(/linkUrl \|\| "products\.html"/g, 'linkUrl || "/products"')
    .replace(/`products\.html\?brand=\$\{encodeURIComponent\(b\.name\)\}`/g, '`/products?brand=${encodeURIComponent(b.name)}`')
    .replace(/`products\.html\?cat=\$\{encodeURIComponent\(c\.id\)\}`/g, '`/products?cat=${encodeURIComponent(c.id)}`')
    .replace(/const url = q \? `products\.html\?q=\$\{encodeURIComponent\(q\)\}` : "products\.html";/g,
      'const url = q ? `/products?q=${encodeURIComponent(q)}` : "/products";')
    .replace(/if \(link\) link\.href = s\.productId \? `product\.html\?id=\$\{s\.productId\}` : "products\.html";/g,
      'if (link) link.href = s.productId ? productUrl(s.productId) : "/products";')
    .replace(/endsWith\("checkout\.html"\)/g, 'includes("/checkout")')
    .replace(/destFile === "products\.html"/g, 'destKey === "products"')
    .replace(/const id = new URLSearchParams\(location\.search\)\.get\("id"\);/g,
      'const id = typeof SitePages !== "undefined" ? SitePages.productIdFromLocation() : new URLSearchParams(location.search).get("id");');
}

const htmlFiles = ["index.html", "products.html", "contact.html", "cart.html", "checkout.html", "order.html", "product.html"];
for (const file of htmlFiles) {
  const filePath = path.join(root, file);
  let content = fs.readFileSync(filePath, "utf8");
  content = patch(content);
  content = content.replace(/js\/routes\.js\?v=\d+/g, "js/routes.js?v=2");
  content = content.replace(/js\/app\.js\?v=\d+/g, "js/app.js?v=65");
  fs.writeFileSync(filePath, content, "utf8");
}

const appPath = path.join(root, "js/app.js");
let app = fs.readFileSync(appPath, "utf8");
app = patch(app);
app = app.replace(
  /function currentPageFile\(\) \{[\s\S]*?\}\n\nfunction navHrefActive\(href\) \{[\s\S]*?return true;\n\}/,
  `function currentPageKey() {
  return typeof SitePages !== "undefined" ? SitePages.currentKey() : (location.pathname.split("/").pop() || "index.html").toLowerCase();
}

function navHrefActive(href) {
  const dest = new URL(href, location.origin);
  if (typeof SitePages !== "undefined") {
    const hereKey = SitePages.pathKey(location.pathname);
    const destKey = SitePages.pathKey(dest.pathname);
    if (hereKey !== destKey) return false;
    if (destKey === "products") {
      return (dest.searchParams.get("cat") || "") === (new URLSearchParams(location.search).get("cat") || "");
    }
    return true;
  }
  const destFile = (dest.pathname.split("/").pop() || "index.html").toLowerCase();
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (destFile !== here) return false;
  if (destFile === "products.html") {
    return (dest.searchParams.get("cat") || "") === (new URLSearchParams(location.search).get("cat") || "");
  }
  return true;
}`
);
app = app.replace(
  /const pages = typeof SitePages !== "undefined"\s*\? SitePages\.MAIN_NAV\.map\(\(key\) => \(\{ href: SitePages\.href\(key\), label: SitePages\.label\(key\), key \}\)\)\s*: \[[\s\S]*?\];/,
  `const pages = typeof SitePages !== "undefined"
    ? SitePages.MAIN_NAV.map((key) => ({ href: SitePages.href(key), label: SitePages.label(key), key })).concat([
        { href: SitePages.href("cart"), label: SitePages.label("cart"), key: "cart" },
      ])
    : [
        { href: "/", label: "الرئيسية", key: "home" },
        { href: "/products", label: "المنتجات", key: "products" },
        { href: "/contact", label: "التواصل", key: "contact" },
        { href: "/cart", label: "السلة", key: "cart" },
      ];`
);
fs.writeFileSync(appPath, app, "utf8");

const adminPath = path.join(root, "admin/js/admin.js");
if (fs.existsSync(adminPath)) {
  let admin = fs.readFileSync(adminPath, "utf8");
  admin = admin
    .replace(/href="\.\.\/index\.html"/g, 'href="/"')
    .replace(/linkUrl \|\| "products\.html"/g, 'linkUrl || "/products"')
    .replace(/linkUrl: "products\.html"/g, 'linkUrl: "/products"')
    .replace(/linkUrl: f\.get\("linkUrl"\) \|\| \(brand \? `products\.html\?brand=\$\{encodeURIComponent\(brand\)\}` : "products\.html"\)/g,
      'linkUrl: f.get("linkUrl") || (brand ? `/products?brand=${encodeURIComponent(brand)}` : "/products")')
    .replace(/link\.value = `products\.html\?brand=\$\{encodeURIComponent\(brand\)\}`/g,
      'link.value = `/products?brand=${encodeURIComponent(brand)}`');
  fs.writeFileSync(adminPath, admin, "utf8");
}

for (const rel of ["server/seed-data.js", "server/db.js"]) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, "utf8");
  content = content
    .replace(/linkUrl: "products\.html"/g, 'linkUrl: "/products"')
    .replace(/link_url TEXT DEFAULT 'products\.html'/g, "link_url TEXT DEFAULT '/products'")
    .replace(/s\.linkUrl \|\| "products\.html"/g, 's.linkUrl || "/products"');
  fs.writeFileSync(filePath, content, "utf8");
}

console.log("Clean URLs applied");
