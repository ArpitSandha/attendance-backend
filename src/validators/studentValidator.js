const validateSignup = (req, res, next) => {
    const { name, email, password, rollNo, department, semester, section } = req.body;
      if (!name || !email || !password || !rollNo || !department || !semester || !section) {
            return res.status(400).json({
                      success: false,
                      message: "All signup fields are required"
    });
  }

  next();
};

// const validateLogin = (req, res, next) => {
//   const { email, password, uuid, deviceHash } = req.body;

//   if (!email || !password || !uuid || !deviceHash) {
//     return res.status(400).json({
//       success: false,
//       message: "All login fields are required"
//     });
//   }

//   next();
// };

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin
};