
const express = require('express');
const { register, login, updateFace } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/updateFace', updateFace);
// router.post('/facelogin', authenticateFace);



module.exports = router;
