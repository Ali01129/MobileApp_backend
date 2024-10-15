const express=require('express');
const fetchUser=require('../middleware/fetchUser');
const userController=require('../controllers/userController');
const router=express.Router();

router.patch('/update',fetchUser,userController.updateUser);
router.get('/profile',fetchUser,userController.profile);
router.post('/changePassword',fetchUser,userController.changePassword);
router.patch('/delete',fetchUser,userController.deleteUser);
router.post('/reportIssue',fetchUser,userController.reportIssue);
module.exports=router;