import { Router } from 'express';
import { getSaved, saveListing, unsaveListing } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
router.use(authenticate);
router.get('/saved', getSaved);
router.post('/saved/:listingId', saveListing);
router.delete('/saved/:listingId', unsaveListing);
export default router;
