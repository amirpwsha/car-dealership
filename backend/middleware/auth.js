const jwt = require("jsonwebtoken");
const JWT_SECRET = "dev_secret_change_me"; // دقیقا همونی که توی authRoutes استفاده کردی

// چک کردن اینکه کاربر لاگین هست یا نه
function authRequired(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "ابتدا وارد شوید" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "توکن نامعتبر است" });
  }
}

// فقط مدیر
function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "اجازه دسترسی ندارید (Admin فقط)" });
  }
  next();
}

// فقط مشتری
function customerOnly(req, res, next) {
  if (req.user?.role !== "customer") {
    return res.status(403).json({ error: "فقط مشتری‌ها اجازه دارند" });
  }
  next();
}

module.exports = { authRequired, adminOnly, customerOnly };
