
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');


dotenv.config();

exports.register = async (req, res) => {
  
  const { name, email,phone, password } = req.body;
  console.log({phone})

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email,phone, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ where: { phone } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
};





exports.updateFace = async (req, res) => {
  const { userId, faceDescriptor } = req.body; // Expecting the face descriptor in the request body

  try {
    // Find the user by userId
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update face descriptor
    user.faceDescriptor = faceDescriptor; // You should handle faceDescriptor validation if necessary
    await user.save();

    res.status(200).json({ message: 'Face data updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// exports.authenticateFace = async (req, res) => {
//   const { faceEmbedding } = req.body; // Receive the face embedding from the client

//   try {
//     const users = await User.findAll(); // Fetch all users
//     const io = getIOInstance();
//     let authenticatedUser = null;

//     for (const user of users) {
//       const storedEmbedding = tf.tensor(user.faceEmbedding);
//       const inputEmbedding = tf.tensor(faceEmbedding);

//       // Calculate cosine similarity
//       const dotProduct = tf.sum(tf.mul(storedEmbedding, inputEmbedding));
//       const magnitudeA = tf.sqrt(tf.sum(tf.square(storedEmbedding)));
//       const magnitudeB = tf.sqrt(tf.sum(tf.square(inputEmbedding)));
//       const similarity = dotProduct.div(magnitudeA.mul(magnitudeB)).dataSync()[0];

//       io.emit('authenticationProgress', { username: user.name, similarity });

//       if (similarity > 0.9) { // Threshold for successful authentication
//         authenticatedUser = user;
//         break;
//       }
//     }

//     if (!authenticatedUser) {
//       io.emit('authenticationFailed', { message: 'No match found!' });
//       return res.status(401).json({ message: 'Authentication failed!' });
//     }

//     // Generate JWT token for the authenticated user
//     const token = jwt.sign(
//       { id: authenticatedUser.id, username: authenticatedUser.username },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     io.emit('authenticationSuccess', { authenticatedUser });
//     res.status(200).json({
//       message: 'Authentication successful!',
//       token,
//       user: {
//         id: authenticatedUser.id,
//         username: authenticatedUser.username,
//       },
//     });
//   } catch (error) {
//     const io = getIOInstance();
//     io.emit('authenticationError', { error: error.message });
//     res.status(500).json({ message: error.message });
//   }
// };


