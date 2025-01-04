import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import adminHelper from '../helpers/admin-helper.js';
import bodyParser from 'body-parser';
import multer from 'multer';

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
      next();
  } else {
      res.render('admin/admin-login');
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
  res.render('admin/admin-signup');
});

router.post('/adminsignup', (req, res) => {
  console.log(req.body);
  adminHelper.addAdmin(req.body).then((status) => {
    console.log(status);
    if (status) {
      req.session.loggedIn = true;
      req.session.username = req.body.adminName;
      adminHelper.adminPost(req.body.username).then((products) => {
        res.render('admin/admin-index', { hotels: products });
      });
    } else {
      res.render('admin/admin-signup');
    }
  }).catch((err) => {
    console.error('Error adding admin:', err);
    res.render('admin/admin-signup');
  });
});

router.get('/admin-signup', (req, res) => {
  res.render('admin/admin-signup');
});

router.get('/admin-login', (req, res) => {
  res.render('admin/admin-login');
});

router.post('/adminlogin', (req, res) => {
  adminHelper.isAdmin(req.body).then((status) => {
    console.log(status);
    if (status) {
      req.session.loggedIn = true;
      req.session.username = req.body.username;
      adminHelper.adminPost(req.body.username).then((products) => {
        res.render('admin/admin-index', { hotels: products });
      });
    } else {
      res.render('admin/admin-signup');
    }
  }).catch((err) => {
    console.error('Error during admin login:', err);
    res.render('admin/admin-signup');
  });
});

router.get('/upload', (req, res) => {
  res.render('admin/upload');
});

router.post('/adminsUpload', upload.single('hotelPhoto'), (req, res) => {
  const photo = req.file ? req.file.filename : null;
  if (!photo) {
    console.error('Failed to upload photo');
    return res.status(400).send('Failed to upload photo');
  }

  adminHelper.hotelDetail(req.body, photo).then((status) => {
    if (status) {
      console.log('Details added');
      res.redirect('/admin/admin-index');
    } else {
      console.log('Failed to add details');
      res.status(500).send('Failed to add details');
    }
  }).catch((err) => {
    console.error('Error in adding hotel details:', err);
    res.status(500).send('Error in adding hotel details');
  });
});

router.get('/admin-index', verifyLogin, (req, res) => {
  adminHelper.adminPost(req.session.username).then((products) => {
    res.render('admin/admin-index', { hotels: products });
  });
});

router.get('/edit/:id', (req, res) => {
  const hotelId = req.params.id;
  adminHelper.getSpecificAdminPost(hotelId).then((result) => {
    res.render('admin/admin-edit', { hotel: result });
  });
});

router.post('/update/:id', upload.single('hotelphoto'), (req, res) => {
  const hotelId = req.params.id;
  const updatedHotelData = req.body;
  const photo = req.file ? req.file.filename : req.body.currentPhoto;

  if (photo) {
      updatedHotelData.hotelphoto = photo;
  }

  adminHelper.updateHotel(hotelId, updatedHotelData).then((status) => {
      if (status) {
          res.redirect('/admin/admin-index');
      } else {
          console.log('Failed to update hotel details');
          res.status(500).send('Failed to update hotel details');
      }
  }).catch((err) => {
      console.error('Error updating hotel details:', err);
      res.status(500).send('Error updating hotel details');
  });
});

router.get('/orders', verifyLogin, (req, res) => {
  adminHelper.getHotelId(req.session.username).then((result) => {
    if (Array.isArray(result)) {
      let hotelIds = result.map(item => item.id);
      console.log(hotelIds);

      if (hotelIds.length > 0) {
          adminHelper.getOrderByIds(hotelIds).then((orders) => {
              if (!Array.isArray(orders)) {
                  orders = [orders];  // Convert single order object to array
              }
              //console.log('Fetched Orders:', orders);  // Verify orders content
              res.render('admin/admin-order', { orders: orders });
          }).catch((err) => {
              console.log('Error fetching order details:', err);
              res.send('Error fetching order details');
          });
      } else {
          res.render('admin/admin-order', { orders: [] });
      }
    } else {
      console.log('Error: result is not an array');
      res.send('Error fetching hotel ids');
    }
  }).catch((err) => {
    console.log('Error fetching hotel ids:', err);
    res.send('Error fetching hotel ids');
  });
});


router.get('/order/:id',(req,res)=>{
  console.log(req.params.id);
  
  adminHelper.getSpeificOrderDetail(req.params.id).then((orders)=>{
    res.render('admin/admin-detailedorder',{order:orders})

  })

})

router.get('/logout',verifyLogin,(req,res)=>{
  req.session.loggedIn=false;
  res.redirect('/admin/admin-login');

});

router.post('/delete-hotel', verifyLogin, (req, res) => {
  const { hotelId } = req.body;
  const username = req.session.username;

  adminHelper.deleteHotel(username, hotelId).then(() => {
      res.json({ success: true });
  }).catch((err) => {
      console.log('Error deleting from cart:', err);
      res.json({ success: false });
  });
});

export default router;
