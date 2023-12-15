const express = require('express');
const { signup, signin, signout, loadSignin, loadDashboard, loadusers, loadproduct } = require('../../controller/admin/auth');
const { validateSignupRequest, isRequestValidated, validateSigninRequest } = require('../../validator/auth');
const { requireSignin } = require('../../common-middleware');
const router = express();


// admin dashboard view start

router.set('view engine', 'ejs');
router.set('views', './views/Admin');



// router.get('/',  loadDashboard)
// router.get('/admin/dashboard', loadDashboard)
// router.get('/admin/users',  loadusers)
// router.get('/admin/product',  loadproduct)
// router.get('/admin/signin',  loadSignin)



// admin dashboard view end


router.post('/admin/signup', validateSignupRequest, isRequestValidated, signup);
router.post('/admin/signin', validateSigninRequest, isRequestValidated, signin);
router.post('/admin/signout', signout)


module.exports = router;