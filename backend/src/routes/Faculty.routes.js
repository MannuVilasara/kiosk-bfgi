import express from 'express';
import {
  addFaculty,
  bulkAddFaculty,
  deleteFaculty,
  getAllFaculties,
  getFacultyById,
  updateFaculty,
} from '../controller/Faculty.controller.js';

const router = express.Router();

router.post('/add', addFaculty);
router.post('/bulk-add', bulkAddFaculty);
router.get('/all', getAllFaculties);
router.get('/:id', getFacultyById);
router.get('/delete/:id', deleteFaculty);
router.put('/update/:id', updateFaculty);

export default router;
