import data from "../data/materias.json";
import { MarkerType } from "reactflow";
import "./styles.css";

export function cargarMaterias() {
  let y = -160;
  let x = 0;

  let anioActual = data[0].anio;
  let nivelActual = data[0].nivel;
  let materiasCorrelativas = {};
  let initialEdges = [];
  const coloresPorAnio = {
    "Primer Año": "#e21d1d",
    "Segundo Año": "#06b8f9",
    "Tercer Año": "#08f728",
    "Cuarto Año": "#fbc704",
    "Quinto Año": "#8f4ae8",
  };
  const coloresCursablesPorAnio = {
    "Primer Año": "#f08e8e",
    "Segundo Año": "#83dcfc",
    "Tercer Año": "#83fb93",
    "Cuarto Año": "#fde281",
    "Quinto Año": "#b98ef0",
  };
  let colorActual = coloresPorAnio["Primer Año"];
  let colorCursableActual = coloresCursablesPorAnio["Primer Año"];

  const initialNodes = data.map((materia) => {
    if (materia.anio !== anioActual || materia.nivel !== nivelActual) {
      x += 200;
      y = 0;
      if (materia.anio !== anioActual) {
        colorActual = coloresPorAnio[materia.anio];
        colorCursableActual = coloresCursablesPorAnio[materia.anio];
        anioActual = materia.anio;
      }

      if (materia.nivel !== nivelActual) {
        nivelActual = materia.nivel;
      }
    } else {
      y += 160;
    }

    materiasCorrelativas = materia.correlativas.split("-");

    materiasCorrelativas.forEach((codCorrelativa) => {
      initialEdges.push({
        id: "e" + codCorrelativa + "-" + materia.codigo,
        source: codCorrelativa,
        target: materia.codigo.toString(),
        data: { colorAprobado: colorActual, esCursable: false },
        type: "straight",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: colorActual },
      });
    });

    return {
      id: materia.codigo.toString(),
      position: { x: x, y: y },
      data: {
        label: materia.materia,
        colorAprobado: colorActual,
        colorCursable: colorCursableActual,
        estaAprobada: false,
        estaCursable: false,
        correlativas: materiasCorrelativas,
      },
      sourcePosition: "right",
      targetPosition: "left",
      style: {
        background: colorActual,
      },
      hidden: false,
    };
  });

  return { initialNodes, initialEdges };
}
