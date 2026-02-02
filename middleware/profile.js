export function ensureProfileComplete(req, res, next) {
  if (!req.user.iscomplete) {
    return res.redirect("/set-username");
  }
  next();
}
