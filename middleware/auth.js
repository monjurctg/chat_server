
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');

// dotenv.config();

// module.exports = (req, res, next) => {

//   const token = req.header('Authorization');
//   console.log(token)
//   if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log({decoded})
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.log(err)
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };


const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.header('Authorization');


  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Check if the token starts with "Bearer "
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;


  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log({ decoded }); // Debugging: Check the decoded token
    req.user = decoded; // Attach user info to the request
    next();
  } catch (err) {
    console.log(err); // Debugging: Log the error
    res.status(401).json({ message: 'Invalid token' });
  }
};
