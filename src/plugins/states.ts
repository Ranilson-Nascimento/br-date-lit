import { BRHoliday } from "../types";
import { at00 } from "../utils";
import { registerStateHolidays } from "../holidays";

export function seedStateHolidays(year: number) {
  const sp: BRHoliday[] = [
    {
      id: "revolucao_constitucionalista",
      name: "Revolução Constitucionalista (SP)",
      scope: "state",
      state: "SP",
      date: at00(new Date(year, 6, 9)),
      movable: false
    }
  ];
  registerStateHolidays("SP", year, sp);

  const rj: BRHoliday[] = [
    {
      id: "sao_jorge",
      name: "São Jorge (RJ)",
      scope: "state",
      state: "RJ",
      date: at00(new Date(year, 3, 23)),
      movable: false
    }
  ];
  registerStateHolidays("RJ", year, rj);

  const ba: BRHoliday[] = [
    {
      id: "independencia_bahia",
      name: "Independência da Bahia (BA)",
      scope: "state",
      state: "BA",
      date: at00(new Date(year, 6, 2)),
      movable: false
    }
  ];
  registerStateHolidays("BA", year, ba);

  const am: BRHoliday[] = [
    {
      id: "elevacao_amazonas",
      name: "Elevação do Amazonas à Categoria de Província (AM)",
      scope: "state",
      state: "AM",
      date: at00(new Date(year, 8, 5)),
      movable: false
    }
  ];
  registerStateHolidays("AM", year, am);

  const pa: BRHoliday[] = [
    {
      id: "adesao_graopara",
      name: "Adesão do Grão-Pará (PA)",
      scope: "state",
      state: "PA",
      date: at00(new Date(year, 7, 15)),
      movable: false
    }
  ];
  registerStateHolidays("PA", year, pa);

  const pe: BRHoliday[] = [
    {
      id: "data_magna_pernambuco",
      name: "Data Magna de Pernambuco (PE)",
      scope: "state",
      state: "PE",
      date: at00(new Date(year, 2, 6)),
      movable: false
    }
  ];
  registerStateHolidays("PE", year, pe);

  const ma: BRHoliday[] = [
    {
      id: "adesao_maranhao",
      name: "Adesão do Maranhão (MA)",
      scope: "state",
      state: "MA",
      date: at00(new Date(year, 6, 28)),
      movable: false
    }
  ];
  registerStateHolidays("MA", year, ma);

  const ac: BRHoliday[] = [
    {
      id: "aniversario_acre",
      name: "Aniversário do Acre (AC)",
      scope: "state",
      state: "AC",
      date: at00(new Date(year, 5, 15)),
      movable: false
    }
  ];
  registerStateHolidays("AC", year, ac);
}
