import { MarkerType } from "reactflow";
import data from "../data/materias.json";

const coloresAprobadosPorAnio = [
  "#e21d1d",
  "#06b8f9",
  "#08f728",
  "#fbc704",
  "#8f4ae8",
];
const coloresCursablesPorAnio = [
  "#f08e8e",
  "#83dcfc",
  "#83fb93",
  "#fde281",
  "#b98ef0",
];

export function cargarMaterias() {
  let anioAnterior = data[0].anio;
  let cuatrimestreAnterior = data[0].cuatrimestre;

  let y = -160;
  let x = 0;

  let initialEdges = [];

  const initialNodes = data.map((materia) => {
    if (
      materia.anio !== anioAnterior ||
      materia.cuatrimestre !== cuatrimestreAnterior
    ) {
      x += 200;
      y = 0;
      anioAnterior = materia.anio;
      cuatrimestreAnterior = materia.cuatrimestre;
    } else {
      y += 160;
    }

    materia.correlativas.forEach((codCorrelativa) => {
      initialEdges.push({
        id: "e" + codCorrelativa + "-" + materia.codigo,
        source: codCorrelativa.toString(),
        target: materia.codigo.toString(),
        type: "straight",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: coloresAprobadosPorAnio[materia.anio - 1] },
      });
    });

    return {
      id: materia.codigo.toString(),
      position: { x: x, y: y },
      data: {
        label: materia.materia,
        colorAprobado: coloresAprobadosPorAnio[materia.anio - 1],
        colorCursable: coloresCursablesPorAnio[materia.anio - 1],
        estaAprobada: false,
        estaCursable: false,
        correlativas: materia.correlativas,
      },
      hidden: false,
      sourcePosition: "right",
      targetPosition: "left",
      style: {
        background: coloresAprobadosPorAnio[materia.anio - 1],
        boxShadow: "2px 2px 5px 0px rgba(0,0,0,0.75)",
      },
    };
  });

  return { initialNodes, initialEdges };
}
