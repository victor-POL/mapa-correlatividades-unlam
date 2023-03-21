import React from "react";

import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";

import "reactflow/dist/style.css";
import "./DiagramaMaterias.css";
import { cargarMaterias } from "../../services/CargaInfoMaterias";

export default function DiagramaReact() {
  const { initialNodes, initialEdges } = cargarMaterias();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  //   Esconder nodos

  const hide = (hidden) => (nodeOrEdge) => {
    nodeOrEdge.hidden = hidden;
    return nodeOrEdge;
  };

  //   Mostrar todos los nodos

  function mostrarNodos() {
    setNodes((nds) => nds.map(hide(false)));
    setEdges((eds) => eds.map(hide(false)));
  }

  function resaltar(idNodoABuscar) {
    setEdges((eds) =>
      eds.map((aristaActual) => {
        if (
          aristaActual.source === idNodoABuscar ||
          aristaActual.target === idNodoABuscar
        ) {
          // aristaActual.hidden = true;
          aristaActual.className = "normal-edge";
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
        onClick={() => mostrarNodos()}
        className="react-flow__ishidden"
        value="Mostrar todo"
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={(event, node) => {
          ocultarMateria(node.id);
        }}
        onNodeClick={(event, node) => resaltar(node.id)}
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
