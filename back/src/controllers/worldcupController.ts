import { Request, Response } from "express";
import worldcupService from "../services/worldcupService";

class WorldcupController {
  public async getYears(req: Request, res: Response): Promise<void> {
    const years = worldcupService.getYears();
    res.json({ years });
  }

  public async getTeams(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.params.year, 10);
      const teams = await worldcupService.getTeams(year);
      res.json({ teams });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar seleções" });
    }
  }

  public async getTeamStats(req: Request, res: Response): Promise<void> {
    const { team, year } = req.query;
    if (!team || !year) {
      res
        .status(400)
        .json({ error: "Parâmetros 'team' e 'year' são obrigatórios" });
      return;
    }

    try {
      const stats = await worldcupService.getTeamStats(
        String(team),
        parseInt(String(year), 10)
      );
      res.json({ stats });
    } catch (err: any) {
      console.error(err);
      if (err.message === "NOT_FOUND") {
        res.status(404).json({ error: "Time não encontrado" });
      } else {
        res.status(500).json({ error: "Erro ao buscar estatísticas" });
      }
    }
  }

  public async simulateMatch(req: Request, res: Response): Promise<void> {
    const { homeTeam, awayTeam } = req.body;
    if (
      !homeTeam?.name ||
      !homeTeam?.stats ||
      !awayTeam?.name ||
      !awayTeam?.stats
    ) {
      res.status(400).json({
        error:
          "Parâmetros 'homeTeam' e 'awayTeam' com 'name' e 'stats' são obrigatórios",
      });
      return;
    }

    try {
      const result = worldcupService.simulateMatch(homeTeam, awayTeam);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao simular partida" });
    }
  }

  public async simulateMultiple(req: Request, res: Response): Promise<void> {
    const { homeTeam, awayTeam, simulations = 10 } = req.body;
    if (
      !homeTeam?.name ||
      !homeTeam?.stats ||
      !awayTeam?.name ||
      !awayTeam?.stats
    ) {
      res.status(400).json({
        error:
          "Parâmetros 'homeTeam' e 'awayTeam' com 'name' e 'stats' são obrigatórios",
      });
      return;
    }

    try {
      const summary = worldcupService.simulateMultiple(
        homeTeam,
        awayTeam,
        simulations
      );
      res.json(summary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao simular múltiplas partidas" });
    }
  }
}

export default new WorldcupController();
