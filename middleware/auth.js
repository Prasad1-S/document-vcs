export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).render("loginRegister.ejs",{data:"User already Created... Please Login!!"});
}
