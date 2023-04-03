import React, { useState, useCallback } from "react";

import diagramaOriginal from "../../data/diagrama-original.json";

import ReactFlow, {
  ReactFlowProvider,
  Controls,
  ControlButton,
  useNodesState,
  useEdgesState,
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
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
      }
    };

    restoreFlow();
  }, [setNodes, setEdges]);

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
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
    }
  }

  function setearNodosAristasEdicion() {
    if (!seActivoModoResaltado) {
      setSeActivoModoResaltado(true);
      setNodes((listaNodos) =>
        listaNodos.map((nodo) => {
          nodo.style = { background: "#B9B9B9" };
          return nodo;
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
      listaNodos.map((nodo) => {
        if (nodo.id === idMateriaAResaltar) {
          nodo.data.estaAprobada = !nodo.data.estaAprobada;
          if (nodo.data.estaAprobada) {
            nodo.style = { background: nodo.data.colorAprobado };
            nodo.zIndex = 1;
          } else if (nodo.data.estaCursable) {
            nodo.style = { background: nodo.data.colorCursable };
            nodo.zIndex = 1;
          } else {
            nodo.style = { background: "#B9B9B9" };
            nodo.zIndex = 0;
          }
        } else if (
          nodo.data.correlativas.includes(Number(idMateriaAResaltar))
        ) {
          const susCorrelativasEstanAprobadas = nodo.data.correlativas.every(
            (correlativa) =>
              nodes[correlativa].data.estaAprobada && !nodo.data.estaAprobada
          );
          console.log(nodo);

          if (susCorrelativasEstanAprobadas) {
            nodo.data.estaCursable = true;
            nodo.style = { background: nodo.data.colorCursable };
            nodo.zIndex = 1;
            console.log(nodo);
          } else if (!nodo.data.estaAprobada && nodo.data.estaCursable) {
            nodo.data.estaCursable = false;
            nodo.style = { background: "#B9B9B9" };
            nodo.zIndex = 0;
          }
        }

        return nodo;
      })
    );

    // Resaltar aristas salientes
    setEdges((listaAristas) =>
      listaAristas.map((aristaActual) => {
        if (nodes[Number(aristaActual.source)].data.estaAprobada) {
          aristaActual.style = {
            stroke: nodes[aristaActual.target].data.colorAprobado,
          };
          aristaActual.animated = true;
          aristaActual.zIndex = 1;
        } else {
          aristaActual.style = {
            stroke: "#B9B9B9",
          };
          aristaActual.animated = false;
          aristaActual.zIndex = 0;
        }

        return aristaActual;
      })
    );
  }

  //  Ocultar materia
  function ocultarMateria(idMateriaAOcultar) {
    // Ocultar nodo
    setNodes((listaNodos) =>
      listaNodos.map((nodo) =>
        nodo.id === idMateriaAOcultar ? hide(true)(nodo) : nodo
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
        <Controls>
          <ControlButton style={{ width: "auto" }} onClick={onSave}>
            <div>Guardar</div>
          </ControlButton>
          <ControlButton style={{ width: "auto" }} onClick={onRestore}>
            <div>Restaurar</div>
          </ControlButton>
          <ControlButton
            style={{ width: "auto" }}
            onClick={() => {
              setModoEdicion(!modoEdicion);
              setModoResaltado(false);
            }}
          >
            <div>
              {modoEdicion
                ? "Cambiar a Modo visualización"
                : "Cambiar a Modo edición"}
            </div>
          </ControlButton>
          <ControlButton
            style={{ width: "auto" }}
            onClick={() => {
              setearNodosAristasEdicion();
              setModoResaltado(!modoResaltado);
              setModoEdicion(false);
            }}
          >
            <div>
              {modoResaltado
                ? "Cambiar a Modo visualización"
                : "Cambiar a Modo resaltado"}
            </div>
          </ControlButton>
        </Controls>
      </ReactFlow>
    </div>
  );
};

function DiagramaMaterias() {
  return (
    <ReactFlowProvider className="diagrama-react">
      <Diagrama />
    </ReactFlowProvider>
  );
}

export default DiagramaMaterias;
