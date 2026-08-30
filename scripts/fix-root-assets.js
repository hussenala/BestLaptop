const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const storePages = ["index.html", "products.html", "product.html", "contact.html", "cart.html", "checkout.html", "order.html"];

const baseTag = '    <base href="/" />';
const baseNeedle = '<base href="/" />';

const scriptBlock = `    <script src="/js/data.js?v=34"></script>
    <script src="/js/api-client.js?v=56"></script>
    <script src="/js/theme.js"></script>
    <script src="/js/routes.js?v=2"></script>
    <script src="/js/app.js?v=67"></script>`;

function patchStoreHtml(file) {
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, "utf8");

  if (!html.includes(baseNeedle)) {
    html = html.replace(
      /<meta name="viewport"[^>]*>\s*/,
      (m) => `${m}${baseTag}\n`
    );
  }

  html = html
    .replace(/href="img\//g, 'href="/img/')
    .replace(/src="img\//g, 'src="/img/')
    .replace(/href="css\//g, 'href="/css/')
    .replace(/href="js\//g, 'href="/js/')
    .replace(/src="js\//g, 'src="/js/');

  html = html.replace(
    /<script src="\/js\/data\.js[^"]*"><\/script>[\s\S]*?<script src="\/js\/app\.js[^"]*"><\/script>/,
    scriptBlock
  );

  if (file === "index.html") {
    html = html.replace(/href="\/css\/styles\.css\?v=\d+"/, 'href="/css/styles.css?v=57"');
  } else {
    html = html.replace(/href="\/css\/styles\.css\?v=\d+"/, 'href="/css/styles.css?v=57"');
  }

  fs.writeFileSync(filePath, html, "utf8");
}

for (const file of storePages) patchStoreHtml(file);
console.log("Root asset paths fixed for store pages");
