import Kiosk from '../models/kiosk.model.js';
import BuildingLabel from '../models/BuildingLabel.model.js';

// ── Building Label Controllers ───────────────────────────────────────────────

/** GET /api/kiosk/buildinglabel?kioskId=default */
export const getBuildingLabels = async (req, res) => {
  try {
    const kioskId = req.query.kioskId || 'default';
    const labels = await BuildingLabel.find({ kioskId }).lean();
    res.json(labels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/kiosk/buildinglabel
 * Body: { kioskId?: string, buildings: [{ id, name, sub?, lat, lng }] }
 * Upserts all supplied buildings (safe to call repeatedly for seeding).
 */
export const saveBuildingLabels = async (req, res) => {
  try {
    const { kioskId = 'default', buildings } = req.body;
    if (!Array.isArray(buildings) || buildings.length === 0) {
      return res.status(400).json({ message: '`buildings` array is required' });
    }
    const ops = buildings.map((b) => ({
      updateOne: {
        filter: { kioskId, id: b.id },
        update: { $set: { kioskId, id: b.id, name: b.name, sub: b.sub || '', lat: b.lat, lng: b.lng } },
        upsert: true,
      },
    }));
    const result = await BuildingLabel.bulkWrite(ops);
    res.status(201).json({ message: 'Building labels saved', upserted: result.upsertedCount, modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** DELETE /api/kiosk/buildinglabel/:id?kioskId=default */
export const deleteBuildingLabel = async (req, res) => {
  try {
    const kioskId = req.query.kioskId || 'default';
    const { id } = req.params;
    const deleted = await BuildingLabel.findOneAndDelete({ kioskId, id });
    if (!deleted) return res.status(404).json({ message: 'Label not found' });
    res.json({ message: 'Deleted', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Kiosk Registration ───────────────────────────────────────────────────────

export const registerKiosk = async (req, res) => {
  try {
    const { name, coordinates } = req.body;
    if (!name || !coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingKiosk = await Kiosk.findOne({ name });
    if (existingKiosk) {
      return res.status(400).json({ message: 'Kiosk with this name already exists' });
    }
    const kiosk = new Kiosk({
      name,
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng,
      },
    });
    await kiosk.save();
    res.status(201).json({ message: 'Kiosk registered successfully', kiosk });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
