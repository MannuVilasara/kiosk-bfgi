import cloudinary from '../config/Cloudinary.js';
import Faculty from '../models/Faculty.model.js';
import { translateText } from '../utils/translate.js';

/**
 * Translate faculty text fields to hi & pa and return a translations map.
 * Runs Hindi & Punjabi translations in parallel for speed.
 */
const buildTranslations = async (facultyName, designation, qualification) => {
  const fields = [
    { key: 'facultyName', value: facultyName },
    { key: 'designation', value: designation },
    { key: 'qualification', value: qualification },
  ];

  const [hiResults, paResults] = await Promise.all([
    Promise.all(fields.map((f) => translateText(f.value || '', 'hi'))),
    Promise.all(fields.map((f) => translateText(f.value || '', 'pa'))),
  ]);

  return {
    hi: { facultyName: hiResults[0], designation: hiResults[1], qualification: hiResults[2] },
    pa: { facultyName: paResults[0], designation: paResults[1], qualification: paResults[2] },
  };
};

export const addFaculty = async (req, res) => {
  try {
    const {
      facultyName,
      designation,
      qualification,
      totalExperience,
      imageUrl,
      email,
      phoneNumber,
      department,
    } = req.body;

    const uploadImage = await cloudinary.uploader.upload(imageUrl, {
      folder: 'faculty_images',
    });

    // Translate text fields to hi & pa
    const translations = await buildTranslations(facultyName, designation, qualification);

    const newFaculty = new Faculty({
      facultyName,
      designation,
      qualification,
      totalExperience,
      imageUrl: uploadImage.secure_url,
      email,
      phoneNumber,
      department,
      translations,
    });

    await newFaculty.save();
    res.status(201).json({ message: 'Faculty added successfully', faculty: newFaculty });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
};

export const bulkAddFaculty = async (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : req.body.faculties;
    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({ message: 'Provide an array of faculty objects.' });
    }

    const added  = [];
    const failed = [];

    for (const item of list) {
      try {
        const upload = await cloudinary.uploader.upload(item.imageUrl, {
          folder: 'faculty_images',
        });

        const translations = await buildTranslations(
          item.facultyName,
          item.designation,
          item.qualification
        );

        const faculty = await new Faculty({
          facultyName:     item.facultyName,
          designation:     item.designation,
          qualification:   item.qualification,
          totalExperience: item.totalExperience,
          imageUrl:        upload.secure_url,
          email:           item.email       || '',
          phoneNumber:     item.phoneNumber || '',
          department:      item.department  || 'CSE',
          translations,
        }).save();

        added.push(faculty);
      } catch (err) {
        failed.push({ facultyName: item.facultyName, error: err.message });
      }
    }

    res.status(201).json({
      message: `${added.length} added, ${failed.length} failed.`,
      added,
      failed,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.status(200).json({ faculties });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
};

export const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.status(200).json({ faculty });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFaculty = await Faculty.findByIdAndDelete(id);
    if (!deletedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.status(200).json({ message: 'Faculty deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      facultyName,
      designation,
      qualification,
      totalExperience,
      imageUrl,
      email,
      phoneNumber,
      department,
    } = req.body;

    if (imageUrl && imageUrl.startsWith('data:')) {
      const uploadImage = await cloudinary.uploader.upload(imageUrl, {
        folder: 'faculty_images',
      });
      imageUrl = uploadImage.secure_url;
    }

    // Re-translate text fields
    const translations = await buildTranslations(facultyName, designation, qualification);

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id,
      {
        facultyName,
        designation,
        qualification,
        totalExperience,
        imageUrl,
        email,
        phoneNumber,
        department,
        translations,
      },
      { new: true }
    );

    if (!updatedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.status(200).json({ message: 'Faculty updated successfully', faculty: updatedFaculty });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
};
