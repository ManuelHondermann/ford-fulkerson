/**
 * Generador de script ejecutable en Python (Streamlit + NetworkX + Pandas + PyVis)
 * para reproducir exactamente la solución del problema de flujo máximo y corte mínimo.
 */

import { GraphNode, GraphEdge, SimulationResult } from '../types/fordFulkerson';

export function generatePythonScript(
  nodes: GraphNode[],
  edges: GraphEdge[],
  result: SimulationResult
): string {
  const sourceNode = nodes.find((n) => n.isSource) || nodes[0];
  const sinkNode = nodes.find((n) => n.isSink) || nodes[nodes.length - 1];

  const nodesJson = JSON.stringify(
    nodes.map((n) => ({
      id: n.id,
      label: n.label,
      isSource: !!n.isSource,
      isSink: !!n.isSink,
    })),
    null,
    2
  );

  const edgesJson = JSON.stringify(
    edges.map((e) => ({
      source: e.source,
      target: e.target,
      capacity: e.capacity,
    })),
    null,
    2
  );

  return `# -*- coding: utf-8 -*-
"""
=============================================================================
PROYECTO: SIMULADOR DE FLUJO MÁXIMO Y CORTE MÍNIMO (FORD-FULKERSON)
Librerías principales: Streamlit, NetworkX, Pandas, PyVis, Tempfile, OS
Generado automáticamente desde la plataforma de Optimización de Redes.
=============================================================================
"""

import streamlit as st
import pandas as pd
import networkx as nx
from pyvis.network import Network
import streamlit.components.v1 as components
import tempfile
import os
import json

# Configuración de página en Streamlit
st.set_page_config(
    page_title="Ford-Fulkerson: Flujo Máximo y Corte Mínimo",
    page_icon="🌊",
    layout="wide"
)

st.title("🌊 Simulación de Flujo Máximo y Corte Mínimo (Ford-Fulkerson)")
st.markdown("""
**Objetivo General:** Resolver el problema de flujo máximo y corte mínimo mediante el algoritmo 
de Ford-Fulkerson (método de etiquetado), visualizando la red y verificando su relación matemática.
""")

# 1. Definición de la Red (Nodos y Aristas)
NODES_DATA = ${nodesJson}

EDGES_DATA = ${edgesJson}

SOURCE_ID = "${sourceNode.id}"
SINK_ID = "${sinkNode.id}"

# Estructurar datos con Pandas
df_aristas = pd.DataFrame(EDGES_DATA)
df_nodos = pd.DataFrame(NODES_DATA)

# 2. Construcción del Grafo Dirigido con NetworkX
G = nx.DiGraph()

for n in NODES_DATA:
    G.add_node(n["id"], label=n["label"], is_source=n["isSource"], is_sink=n["isSink"])

for e in EDGES_DATA:
    G.add_edge(e["source"], e["target"], capacity=int(e["capacity"]))

# 3. Algoritmo de Ford-Fulkerson (Método de Etiquetado / Edmonds-Karp con BFS)
flow_value, flow_dict = nx.maximum_flow(G, SOURCE_ID, SINK_ID, flow_func=nx.algorithms.flow.edmonds_karp)

# Determinar Corte Mínimo (S, T)
reachable, non_reachable = nx.minimum_cut(G, SOURCE_ID, SINK_ID, flow_func=nx.algorithms.flow.edmonds_karp)[1]

# Calcular Aristas del Corte
cut_edges = []
cut_capacity = 0
for u in reachable:
    for v in non_reachable:
        if G.has_edge(u, v):
            cap = G[u][v]["capacity"]
            cut_edges.append((u, v, cap))
            cut_capacity += cap

# 4. Métricas en Streamlit
col1, col2, col3 = st.columns(3)
with col1:
    st.metric(label="Flujo Máximo |f|", value=f"{flow_value} unidades")
with col2:
    st.metric(label="Capacidad del Corte Mínimo c(S, T)", value=f"{cut_capacity} unidades")
with col3:
    is_verified = (flow_value == cut_capacity)
    st.metric(label="Teorema Max-Flow Min-Cut", value="✅ Verificado" if is_verified else "❌ Discrepancia")

st.divider()

# 5. Visualización Interactiva con PyVis
st.subheader("🌐 Visualización Interactiva de la Red (PyVis)")

net = Network(height="520px", width="100%", directed=True, bgcolor="#ffffff", font_color="#1e293b")
net.set_options("""
var options = {
  "physics": {
    "barnesHut": {
      "gravitationalConstant": -3000,
      "centralGravity": 0.3,
      "springLength": 130
    },
    "minVelocity": 0.75
  }
}
""")

# Agregar nodos coloreados según conjunto S o T
for n in NODES_DATA:
    node_id = n["id"]
    label = n["label"]
    if node_id in reachable:
        color = "#22c55e" if n["isSource"] else "#38bdf8" # Verde fuente / Celeste S
        group = "Conjunto S (Alcanzable)"
    else:
        color = "#ef4444" if n["isSink"] else "#cbd5e1" # Rojo sumidero / Gris T
        group = "Conjunto T"
    
    net.add_node(
        node_id, 
        label=f"{label}\\n({group})", 
        color=color, 
        size=26 if (n["isSource"] or n["isSink"]) else 20,
        shape="circle"
    )

# Agregar aristas con etiquetas de flujo / capacidad
for e in EDGES_DATA:
    u = e["source"]
    v = e["target"]
    cap = e["capacity"]
    f = flow_dict.get(u, {}).get(v, 0)
    
    is_saturated = (f >= cap)
    is_in_cut = (u in reachable and v in non_reachable)
    
    if is_in_cut:
        color = "#e11d48" # Rojo corte
        width = 4
    elif is_saturated:
        color = "#f59e0b" # Ámbar saturada
        width = 3
    else:
        color = "#64748b" # Gris/azul estándar
        width = 2
        
    net.add_edge(
        u, 
        v, 
        title=f"Flujo: {f} / Capacidad: {cap}", 
        label=f"{f} / {cap}", 
        color=color, 
        width=width,
        arrows="to"
    )

# Renderizar en Streamlit a través de archivo temporal HTML y components.v1
with tempfile.NamedTemporaryFile(delete=False, suffix=".html") as tmp_file:
    path = tmp_file.name
    net.save_graph(path)
    with open(path, "r", encoding="utf-8") as f:
        html_content = f.read()
    components.html(html_content, height=540)
    os.remove(path)

# 6. Tablas Detalladas con Pandas
st.subheader("📊 Análisis de Aristas y Cuellos de Botella (Pandas)")

rows = []
for e in EDGES_DATA:
    u = e["source"]
    v = e["target"]
    cap = e["capacity"]
    f = flow_dict.get(u, {}).get(v, 0)
    residual = cap - f
    saturated = (f >= cap)
    in_cut = (u in reachable and v in non_reachable)
    
    rows.append({
        "Origen": u,
        "Destino": v,
        "Capacidad": cap,
        "Flujo Óptimo": f,
        "Capacidad Residual": residual,
        "¿Saturada?": "Sí" if saturated else "No",
        "¿En Corte Mínimo?": "Sí ⭐" if in_cut else "No"
    })

df_report = pd.DataFrame(rows)
st.dataframe(df_report, use_container_width=True)

# 7. Verificación de Partición de Corte
st.subheader("✂️ Partición del Corte Mínimo")
col_s, col_t = st.columns(2)
with col_s:
    st.success(f"**Conjunto S (Alcanzables desde la Fuente):** {sorted(list(reachable))}")
with col_t:
    st.error(f"**Conjunto T (No Alcanzables - Sumidero):** {sorted(list(non_reachable))}")

st.info(f"Capacidad total del corte mínimo calculada sumando capacidades de S hacia T = {cut_capacity} = Flujo Máximo {flow_value}.")
`;
}
