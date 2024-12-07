
const express = require('express');
const { register, login, updateFace,getLoginUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/updateFace', updateFace);
router.get('/getLoginUser',authMiddleware,getLoginUser)


// router.post('/facelogin', authenticateFace);



module.exports = router;
