import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import userHelper from '../helpers/user-helper.js';
import bodyParser from 'body-parser';

const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.render('user/user-login');
    }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/', (req, res) => {
    res.render('user/user-signup');
});

router.get('/user-login', (req, res) => {
    res.render('user/user-login');
});

router.get('/user-signup', (req, res) => {
    res.render('user/user-signup');
});

router.post('/usersignup', (req, res) => {
    //console.log(req.body);
    userHelper.addUser(req.body).then((status) => {
        if (status) {
            req.session.loggedIn = true;
            req.session.useremail = req.body.email;
            res.redirect('/user/user-index')
        } else {
            res.send('Something went wrong');
        }
    }).catch((err) => {
        console.log('Error adding user:', err);
        res.send('Something went wrong');
    });
});

router.post('/userlogin', (req, res) => {
    userHelper.isUser(req.body).then((status) => {
        if (status) {
            req.session.loggedIn = true;
            req.session.useremail = req.body.email;
            userHelper.getHotel().then((product) => {
                //console.log(product);
                res.render('user/user-index', { hotels: product });
            }).catch((err) => {
                console.log('Error fetching hotels:', err);
                res.render('user/user-index', { hotels: [] });
            });
        } else {
            res.render('user/user-signup');
        }
    }).catch((err) => {
        console.log('Error checking user:', err);
        res.render('user/user-signup');
    });
});

router.get('/user-index', verifyLogin, (req, res) => {
    userHelper.getHotel().then((product) => {
        res.render('user/user-index', { hotels: product });
    }).catch((err) => {
        console.log('Error fetching hotels:', err);
        res.render('user/user-index', { hotels: [] });
    });
});

router.get('/hotel/:id',verifyLogin, (req, res) => {
    const hotelId = req.params.id;
    //console.log(hotelId);
    userHelper.getSpecifcdetails(hotelId).then((products) => {
        res.render('user/user-booking', { hotels: products });
    }).catch((err) => {
        console.log('Error fetching hotel details:', err);
        res.send('Error fetching hotel details');
    });
});

router.post('/book-hotel', (req, res) => {
    userHelper.orderDetails(req.body).then((status) => {
        console.log(status);
        if (status) {
            userHelper.getLastOrderByEmail(req.body.email).then((order) => {
                //console.log(order);
                res.render('user/user-history', { order: order });
            });
        } else {
            res.redirect('/user/user-index');
        }
    });
});

router.get('/home/:email', (req, res) => {
    req.session.useremail = req.params.email;
    res.redirect('/user/user-index');
});

router.get('/orders',verifyLogin,(req,res)=>{
    userHelper.getAllOrders(req.session.useremail).then((product)=>{
        res.render('user/user-summary',{orders:product});
    })
})

router.get('/order-details/:id',verifyLogin,(req,res)=>{
    userHelper.getSpecificOrder(req.params.id).then((product)=>{
        res.render('user/user-detailedorder',{order:product});
    })

})

router.post('/add-to-cart', verifyLogin, (req, res) => {
    const { hotelId } = req.body;
    const userEmail = req.session.useremail;

    userHelper.addToCart(userEmail, hotelId).then(() => {
        res.json({ success: true });
    }).catch((err) => {
        console.log('Error adding to cart:', err);
        res.json({ success: false });
    });
});

router.get('/user-whistlist', verifyLogin, (req, res) => {
    const username = req.session.useremail;
    userHelper.getCartItems(username).then((cartItems) => {
        if (Array.isArray(cartItems)) {
            let hotelIds = cartItems.map(item => item.hotel_id);
            console.log(hotelIds);
            
            if (hotelIds.length > 0) {
                userHelper.getHotelsByIds(hotelIds).then((hotels) => {
                    console.log(hotels);
                    
                    res.render('user/user-whistlist', { hotels: hotels });
                }).catch((err) => {
                    console.log('Error fetching hotel details:', err);
                    res.send('Error fetching hotel details');
                });
            } else {
                res.render('user/user-whistlist', { hotels: [] });
            }
        } else {
            console.log('Error: cartItems is not an array');
            res.send('Error fetching cart items');
        }
    }).catch((err) => {
        console.log('Error fetching cart items:', err);
        res.send('Error fetching cart items');
    });
});

router.get('/log-out', verifyLogin,(req, res) => {
    req.session.loggedIn = false;
    res.redirect('/user/user-login'); // Note the leading slash
});


router.post('/delete-from-cart', verifyLogin, (req, res) => {
    const { hotelId } = req.body;
    const userEmail = req.session.useremail;

    userHelper.removeFromCart(userEmail, hotelId).then(() => {
        res.json({ success: true });
    }).catch((err) => {
        console.log('Error deleting from cart:', err);
        res.json({ success: false });
    });
});






export default router;
