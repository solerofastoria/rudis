const express = require('express');
const router = express.Router();
const { getUserById, getAllUsers } = require('../controllers/usersController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
