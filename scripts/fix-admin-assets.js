const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function patchAdminHtml(file, relDir) {
  const filePath = path.join(root, relDir, file);
  let html = fs.readFileSync(filePath, "utf8");
  const baseTag = '    <base href="/admin/" />';

  if (!html.includes("<base href=")) {
    html = html.replace(/<meta name="viewport"[^>]*>\s*/, (m) => `${m}${baseTag}\n`);
  }

  html = html
    .replace(/href="\.\.\/img\//g, 'href="/img/')
    .replace(/src="\.\.\/img\//g, 'src="/img/')
    .replace(/href="\.\.\/css\//g, 'href="/css/')
    .replace(/src="\.\.\/js\//g, 'src="/js/')
    .replace(/href="css\//g, 'href="/admin/css/')
    .replace(/src="js\//g, 'src="/admin/js/');

  html = html.replace(
    /<script src="\/js\/data\.js[^"]*"><\/script>[\s\S]*?<script src="\/js\/store-db\.js[^"]*"><\/script>/,
    `    <script src="/js/data.js?v=34"></script>
    <script src="/js/api-client.js?v=56"></script>
    <script src="/js/store-db.js?v=56"></script>`
  );

  if (file === "index.html") {
    html = html.replace(/src="\/admin\/js\/admin\.js[^"]*"/, 'src="/admin/js/admin.js?v=55"');
  }

  html = html
    .replace(/location\.replace\("index\.html"\)/g, 'location.replace("/admin/")')
    .replace(/location\.replace\("login\.html"\)/g, 'location.replace("/admin/login")');

  fs.writeFileSync(filePath, html, "utf8");
}

patchAdminHtml("index.html", "admin");
patchAdminHtml("login.html", "admin");
console.log("Admin HTML asset paths fixed");
