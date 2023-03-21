import data from "../data/materias.json";
import { MarkerType, Position } from "reactflow";

export function cargarMaterias() {
  let y = -160;
  let x = 0;

  let anioActual = data[0].anio;
  let nivelActual = data[0].nivel;
  let materiasCorrelativas = {};
  let initialEdges = [];
  const coloresPorAnio = {
    "Primer Año": "#FFFF00",
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
        type: "straight",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: coloresPorAnio[materia.anio] },
      });
    });

    return {
      id: materia.codigo.toString(),
      position: { x: x, y: y },
      data: { label: materia.materia },
      sourcePosition: "right",
      targetPosition: "left",
      style: {
        background: colorActual,
      },
      connectable: false,
      hidden: false,
    };
  });

  initialNodes.push(
    {
      id: "horizontal-1",
      sourcePosition: "right",
      targetPosition: "left",
      type: "input",
      data: { label: "Input" },
      position: { x: 0, y: 1400 },
    },
    {
      id: "horizontal-2",
      sourcePosition: "right",
      targetPosition: "left",
      data: { label: "A Node" },
      position: { x: 200, y: 1400 },
    }
  );

  initialEdges.push({
    id: "horizontal-e1-2",
    source: "horizontal-1",
    type: "smoothstep",
    target: "horizontal-2",
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  });
  return { initialNodes, initialEdges };
}
