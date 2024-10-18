const express=require('express');
const fetchUser=require('../middleware/fetchUser');
const adminController = require("../controllers/adminController");
const router=express.Router();

router.get('/getIssues',adminController.getIssues);
router.patch('/disableUserAccount',adminController.disableUserAccount);
router.get('/allAdmins',adminController.allAdmins);
router.patch('/updateAdmin',fetchUser,adminController.updateAdmin);
router.patch('/changeAdminPassword',fetchUser,adminController.changeAdminPassword);
router.get('/allusers',adminController.allUsers);

module.exports=router;