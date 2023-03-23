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

const Diagrama = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [modoResaltado, setModoResaltado] = useState(false);
  const [seActivoModoResaltado, setSeActivoModoResaltado] = useState(false);

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
  }

  function setearNodosAristasEdicion() {
    if (!seActivoModoResaltado) {
      setSeActivoModoResaltado(true);
      setNodes((listaNodos) =>
        listaNodos.map((nodoActual) => {
          nodoActual.style = { background: "#B9B9B9" };
          return nodoActual;
        })
      );

      setEdges((listaAristas) =>
        listaAristas.map((aristaActual) => {
          aristaActual.style = { stroke: "#B9B9B9" };
          return aristaActual;
        })
      );
    }
  }

  function resaltarMateria(idMateriaAResaltar) {
    // Resaltar nodo
    setNodes((listaNodos) =>
      listaNodos.map((nodoActual) => {
        if (nodoActual.id === idMateriaAResaltar) {
          nodoActual.data.estaAprobada = !nodoActual.data.estaAprobada;
          if (nodoActual.data.estaAprobada) {
            nodoActual.style = {
              background: nodoActual.data.colorAprobado,
              fontWeight: "bold",
            };
            nodoActual.zIndex = 1;
          } else {
            nodoActual.style = { background: "#B9B9B9" };
            nodoActual.zIndex = 0;
          }
        } else if (nodoActual.data.correlativas.includes(idMateriaAResaltar)) {
          if (
            nodoActual.data.correlativas.every(
              (correlativa) => nodes[correlativa].data.estaAprobada
            )
          ) {
            nodoActual.data.estaAprobada = true;
            nodoActual.style = {
              background: nodoActual.data.colorCursable,
            };
          } else if (
            !nodes[idMateriaAResaltar].data.estaAprobada &&
            nodoActual.data.estaAprobada
          ) {
            nodoActual.data.estaAprobada = false;
            nodoActual.style = { background: "#B9B9B9" };
          }
        }

        return nodoActual;
      })
    );

    // Resaltar aristas salientes
    setEdges((listaAristas) =>
      listaAristas.map((aristaActual) => {
        if (
          aristaActual.source === idMateriaAResaltar ||
          nodes[Number(aristaActual.source)].data.estaAprobada
        ) {
          if (
            nodes[idMateriaAResaltar].data.estaAprobada ||
            nodes[Number(aristaActual.source)].data.estaAprobada
          ) {
            aristaActual.style = { stroke: aristaActual.data.colorAprobado };
            aristaActual.animated = true;
            aristaActual.data.estaAprobada = true;
            aristaActual.zIndex = 1;
          } else {
            aristaActual.style = { stroke: "#B9B9B9" };
            aristaActual.animated = false;
            aristaActual.data.estaAprobada = false;
            aristaActual.zIndex = 0;
          }
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
          setearNodosAristasEdicion();
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
      <Diagrama />
    </ReactFlowProvider>
  );
}

export default DiagramaMaterias;
