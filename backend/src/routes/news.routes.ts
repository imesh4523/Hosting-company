import { Router } from 'express';
import * as newsController from '../controllers/news.controller.js';

const router = Router();

router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);
router.post('/', newsController.createNews);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

export default router;
