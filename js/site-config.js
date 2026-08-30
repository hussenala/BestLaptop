const SiteConfig = (() => {
  const meta = document.querySelector('meta[name="site-url"]');
  const configured = (meta?.content || "").trim().replace(/\/$/, "");
  const url = configured || location.origin;

  function adminPath(file = "login.html") {
    return `/admin/${file}`.replace(/\/+/g, "/");
  }

  return {
    url,
    adminLogin: `${url}/admin/login`,
    adminPanel: `${url}/admin`,
    isAdminPage: () => /^\/admin(\/|$)/.test(location.pathname),
  };
})();
