const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

router.post('/inscription', registerUser);
router.post('/connexion', loginUser);

module.exports = router;
