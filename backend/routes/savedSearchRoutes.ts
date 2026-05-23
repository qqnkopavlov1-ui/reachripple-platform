import { Router, Request, Response } from "express";
import auth from "../middleware/auth";
import SavedSearch from "../models/SavedSearch";
import logger from "../utils/logger";

const router = Router();

interface AuthedRequest extends Request {
  user?: { _id?: string; id?: string };
}
const uid = (req: AuthedRequest) => req.user?._id || req.user?.id;

// List my saved searches
router.get("/", auth, async (req: AuthedRequest, res: Response) => {
  try {
    const items = await SavedSearch.find({ userId: uid(req) }).sort({ createdAt: -1 }).limit(50);
    res.json({ ok: true, items });
  } catch (err) {
    logger.error("savedSearches.list error", err);
    res.status(500).json({ ok: false, error: "Failed to list saved searches" });
  }
});

// Create
router.post("/", auth, async (req: AuthedRequest, res: Response) => {
  try {
    const { name, query, path, filters } = req.body || {};
    if (!name || !path) {
      return res.status(400).json({ ok: false, error: "name and path required" });
    }
    const existing = await SavedSearch.countDocuments({ userId: uid(req) });
    if (existing >= 50) {
      return res.status(400).json({ ok: false, error: "Maximum 50 saved searches" });
    }
    const item = await SavedSearch.create({
      userId: uid(req),
      name: String(name).slice(0, 120),
      query: String(query || ""),
      path: String(path),
      filters: filters && typeof filters === "object" ? filters : {},
    });
    res.status(201).json({ ok: true, item });
  } catch (err) {
    logger.error("savedSearches.create error", err);
    res.status(500).json({ ok: false, error: "Failed to save search" });
  }
});

// Delete
router.delete("/:id", auth, async (req: AuthedRequest, res: Response) => {
  try {
    const r = await SavedSearch.deleteOne({ _id: req.params.id, userId: uid(req) });
    if (r.deletedCount === 0) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    logger.error("savedSearches.delete error", err);
    res.status(500).json({ ok: false, error: "Failed to delete saved search" });
  }
});

export default router;
