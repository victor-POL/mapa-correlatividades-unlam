import data from "../data/materias.json";
import { MarkerType } from "reactflow";

export function cargarMaterias() {
  let y = -160;
  let x = 0;

  let anioActual = data[0].anio;
  let nivelActual = data[0].nivel;
  let materiasCorrelativas = {};
  let initialEdges = [];
  const coloresPorAnio = {
    "Primer Año": "#FF0000",
    "Segundo Año": "#00FFFF",
    "Tercer Año": "#FF00FF",
    "Cuarto Año": "#80FF00",
    "Quinto Año": "#FF8000",
  };
  let colorActual = coloresPorAnio["Primer Año"];

  const initialNodes = data.map((materia) => {
    if (materia.anio !== anioActual || materia.nivel !== nivelActual) {
      x += 200;
      y = 0;
      if (materia.anio !== anioActual) {
        colorActual = coloresPorAnio[materia.anio];
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
        data: { color: colorActual, isSelected: false },
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
      data: { label: materia.materia, color: colorActual, isSelected: false },
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
