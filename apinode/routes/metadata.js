const express = require('express');

const router = express.Router();

//appelle aux controleurs
const metaCtrl = require('../controllers/metadata');


router.get('/health', metaCtrl.getHealth);
router.get('/status', metaCtrl.getStatus);
router.get('/info', metaCtrl.getInfo);


module.exports = router;