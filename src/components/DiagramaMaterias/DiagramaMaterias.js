import React, { useState, useCallback } from "react";

import diagramaOriginal from "../../data/diagrama-original.json";

import ReactFlow, {
  ReactFlowProvider,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";
import "./DiagramaMaterias.css";
import { cargarMaterias } from "../../services/CargaInfoMaterias";

const flowKey = "diagrama-modificado";
const { initialNodes, initialEdges } = cargarMaterias();

const SaveRestore = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [modoResaltado, setModoResaltado] = useState(false);

  // Guardar diagrama en local storage
  const [rfInstance, setRfInstance] = useState(null);
  const { setViewport } = useReactFlow();

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  //   Esconder nodos

  const hide = (hidden) => (nodeOrEdge) => {
    nodeOrEdge.hidden = hidden;
    return nodeOrEdge;
  };

  //   Mostrar todos los nodos

  function restaurarDiagrama() {
    setModoEdicion(false);
    setModoResaltado(false);

    const flow = diagramaOriginal;

    if (flow) {
      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      setViewport({ x, y, zoom });
    }

    /* setNodes((listaNodos) =>
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
    ); */
  }

  function resaltarMateria(idMateriaAResaltar) {
    setNodes((listaNodos) =>
      listaNodos.map((nodoActual) => {
        if (nodoActual.id === idMateriaAResaltar) {
          nodoActual.data.isSelected = !nodoActual.data.isSelected;
        }
        if (nodoActual.data.isSelected) {
          nodoActual.style = { background: nodoActual.data.color };
        } else {
          nodoActual.style = { background: "#B9B9B9" };
        }
        return nodoActual;
      })
    );

    setEdges((listaAristas) =>
      listaAristas.map((aristaActual) => {
        if (
          aristaActual.source === idMateriaAResaltar /* ||
          aristaActual.target === idMateriaAResaltar */
        ) {
          if (nodes[idMateriaAResaltar].data.isSelected) {
            aristaActual.style = { stroke: aristaActual.data.color };
            aristaActual.animated = true;
            aristaActual.data.isSelected = true;
          } else {
            aristaActual.style = { stroke: "#B9B9B9" };
            aristaActual.animated = false;
            aristaActual.data.isSelected = false;
          }
        } else {
          if (aristaActual.data.isSelected)
            aristaActual.style = { stroke: aristaActual.data.color };
          else aristaActual.style = { stroke: "#B9B9B9" };
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
        value="Inicio"
      />
      <input
        type="button"
        onClick={onSave}
        className="react-flow__ishidden"
        value="Guardar"
      />
      <input
        type="button"
        onClick={onRestore}
        className="react-flow__ishidden"
        value="Restaurar"
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
        onInit={setRfInstance}
      >
        <Controls />
      </ReactFlow>
    </div>
  );
};

function DiagramaMaterias() {
  return (
    <ReactFlowProvider>
      <SaveRestore />
    </ReactFlowProvider>
  );
}

export default DiagramaMaterias;
