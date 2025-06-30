import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

router.get("/years", async (req: Request, res: Response): Promise<any> => {
  try {
    const years: number[] = [
      2022, 2018, 2014, 2010, 2006, 2002, 1998, 1994, 1990, 1986, 1982, 1978,
      1974, 1970, 1966, 1962, 1958, 1954, 1950, 1938, 1934, 1930,
    ];
    res.json({ years });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar anos da Copa do Mundo" });
  }
});

router.get("/teams/:year", async (req, res): Promise<any> => {
  const year = req.params.year;
  try {
    const seasonsResp = await axios.get(
      `https://fbrapi.com/league-standings?league_id=1&season_id=${year}`,
      {
        headers: { "X-API-Key": process.env.FBR_API_KEY },
      }
    );

    const allTeamNames: string[] = [];

    seasonsResp.data.data.forEach((group: any) => {
      group.standings.forEach((team: any) => {
        allTeamNames.push(team.team_name);
      });
    });

    res.json({ teams: allTeamNames });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erro ao buscar seleções para o ano informado" });
  }
});

export default router;
