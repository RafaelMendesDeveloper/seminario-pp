import { Router } from "express";
import worldcupController from "../controllers/worldcupController";

const router = Router();

router.get("/years", worldcupController.getYears.bind(worldcupController));
router.get(
  "/teams/:year",
  worldcupController.getTeams.bind(worldcupController)
);
router.get(
  "/team-stats",
  worldcupController.getTeamStats.bind(worldcupController)
);
router.post(
  "/simulate-match",
  worldcupController.simulateMatch.bind(worldcupController)
);
router.post(
  "/simulate-multiple",
  worldcupController.simulateMultiple.bind(worldcupController)
);

export default router;
