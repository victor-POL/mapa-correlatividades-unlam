import React from "react";

import ReactFlow, { Controls, useNodesState, useEdgesState } from "reactflow";

import "reactflow/dist/style.css";
import "./DiagramaMaterias.css";
import { cargarMaterias } from "../../services/CargaInfoMaterias";

export default function DiagramaReact() {
  const { initialNodes, initialEdges } = cargarMaterias();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [modoEdicion, setModoEdicion] = React.useState(false);
  const [modoResaltado, setModoResaltado] = React.useState(false);

  //   Esconder nodos

  const hide = (hidden) => (nodeOrEdge) => {
    nodeOrEdge.hidden = hidden;
    return nodeOrEdge;
  };

  //   Mostrar todos los nodos

  function restaurarDiagrama() {
    setModoEdicion(false);
    setModoResaltado(false);

    setNodes((listaNodos) =>
      listaNodos.map((nodoActual) => {
        nodoActual.hidden = false;
        nodoActual.style = { background: nodoActual.data.color };
        nodoActual.zIndex = 0;
        nodoActual.data.isSelected = false;
        return nodoActual;
      })
    );
    setEdges((listaAristas) =>
      listaAristas.map((aristaActual) => {
        aristaActual.hidden = false;
        aristaActual.style = { stroke: aristaActual.data.color };
        aristaActual.animated = false;
        aristaActual.zIndex = 0;
        aristaActual.data.isSelected = false;
        return aristaActual;
      })
    );
  }

  function resaltarMateria(idMateriaAResaltar) {
    setNodes((listaNodos) =>
      listaNodos.map((nodoActual) => {
        if (nodoActual.id === idMateriaAResaltar) {
          nodoActual.style = {
            background: nodoActual.data.color,
          };
          nodoActual.data.isSelected = true;
        } else {
          if (nodoActual.data.isSelected === true) {
            nodoActual.style = {
              background: nodoActual.data.color,
            };
          } else {
            nodoActual.style = {
              background: "#B9B9B9",
            };
          }
        }
        return nodoActual;
      })
    );

    setEdges((listaAristas) =>
      listaAristas.map((aristaActual) => {
        if (
          aristaActual.source === idMateriaAResaltar ||
          aristaActual.target === idMateriaAResaltar
        ) {
          aristaActual.animated = true;
          aristaActual.style = {
            stroke: nodes[idMateriaAResaltar].style.background,
          };
          aristaActual.zIndex = 1;
        } else {
          aristaActual.style = {
            stroke: "#B9B9B9",
          };
        }
        return aristaActual;
      })
    );
  }

  //  Ocultar materia
  function ocultarMateria(idMateriaAOcultar) {
    // Ocultar nodo
    setNodes((listaNodos) =>
      listaNodos.map((nodoActual) =>
        nodoActual.id === idMateriaAOcultar
          ? hide(true)(nodoActual)
          : nodoActual
      )
    );
    // Ocultar aristas entrantes y salientes
    setEdges((listaAristas) =>
      listaAristas.map((aristaActual) =>
        aristaActual.source === idMateriaAOcultar ||
        aristaActual.target === idMateriaAOcultar
          ? hide(true)(aristaActual)
          : aristaActual
      )
    );
  }

  //   Retorno

  return (
    <div className="diagrama-react">
      <input
        type="button"
        onClick={() => restaurarDiagrama()}
        className="react-flow__ishidden"
        value="Restaurar Diagrama"
      />
      <input
        type="button"
        onClick={() => {
          setModoEdicion(!modoEdicion);
          setModoResaltado(false);
        }}
        value={
          modoEdicion
            ? "Cambiar a Modo visualización"
            : "Cambiar a Modo edición"
        }
      />
      <input
        type="button"
        onClick={() => {
          setModoResaltado(!modoResaltado);
          setModoEdicion(false);
        }}
        value={
          modoResaltado
            ? "Cambiar a Modo visualización"
            : "Cambiar a Modo resaltado"
        }
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={(_, node) => {
          if (modoEdicion) ocultarMateria(node.id);
        }}
        onNodeClick={(_, node) => {
          if (modoResaltado) resaltarMateria(node.id);
        }}
      >
        <Controls />
      </ReactFlow>
    </div>
  );
}
