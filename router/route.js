const express=require('express')
const usercontroller=require('../controller/userController')
const artworkController = require('../controller/artworkController')
const dashboardController = require('../controller/dashboardController')
const notificationController = require('../controller/notificationController');
const adminNotificationController = require('../controller/adminNotificationController');
const adminDashboardController  = require('../controller/adminDashboardController')
const auth = require('../middleware/Auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const route=new express.Router()

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });




route.post('/api/register',usercontroller.register)
route.post('/api/login',usercontroller.login)
route.post('/api/google-login',usercontroller.googleAuth)

route.get('/api/profile', auth, usercontroller.getProfileById) 

route.post('/api/profile/upload', auth, upload.single('profile'), usercontroller.uploadProfile)

route.put('/api/profile', auth, usercontroller.updateProfile)

route.put('/api/profile/password', auth, usercontroller.changePassword)

route.post('/api/artwork/upload', auth, upload.array('images', 5), artworkController.uploadArtwork)

route.get('/api/artworks', auth, dashboardController.getAllArtworks)

route.post('/api/artworks/:id/likes', auth, dashboardController.toggleLike)

route.get('/api/inbox/notifications', auth, notificationController.getNotifications)

route.put('/api/inbox/notifications/:id/read', auth, notificationController.markNotificationAsRead)

route.get('/api/artworks/myuploads', auth, artworkController.getMyUploads)

route.put('/api/artworks/make-payment', auth, artworkController.makePayment)

route.get('/api/artworks/:id', auth, artworkController.getArtworkById)

route.put('/api/artworks/:id', auth, artworkController.updateArtwork)

route.delete('/api/artworks/:id', auth, artworkController.deleteArtwork)





route.post('/api/artworks/:id/comments', auth, artworkController.addCommentToArtwork)

route.post('/api/admin/adminNotifications', auth, adminNotificationController.createNotification)


route.get('/api/admin/stats', auth, adminDashboardController.getDashboardStats)

route.get("/api/admin/inbox", auth, adminNotificationController.getAdminNotifications)

route.put("/api/admin/inbox/:id/read", auth, adminNotificationController.markAsRead)



module.exports=route