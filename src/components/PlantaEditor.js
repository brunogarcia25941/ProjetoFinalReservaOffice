import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Image } from 'react-konva';

function PlantaEditor({ recursos, setRecursos, salvarCoordenadasNaBD }) {
  // Referência para o Palco (Stage) do Konva, necessária para capturar a posição do ponteiro do rato
  const stageRef = useRef(null);
  
  // Estado para armazenar temporariamente o ID do recurso que está a ser arrastado da lista lateral
  const [draggedResourceId, setDraggedResourceId] = useState(null);


  // Estado para guardar o objeto da imagem carregada
  const [imageObj, setImageObj] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = '/planta.png'; // Caminho para a imagem na pasta public/
    img.onload = () => {
      setImageObj(img);
    };
  }, []);

  // Quando o utilizador começa o drag e acaba o drag
  const handleStageDragStart = (id) => {
    setDraggedResourceId(id);
  };

  const handleStageDrop = (e) => {
    e.preventDefault();
    if (!draggedResourceId) return;

    // Diz ao Konva para ler o evento nativo do browser e registar a posição interna do ponteiro
    stageRef.current.setPointersPositions(e);
    const pointerPosition = stageRef.current.getPointerPosition();

    const grid = 25; // tamanho da grelha
    const snappedX = Math.round(pointerPosition.x / grid) * grid;
    const snappedY = Math.round(pointerPosition.y / grid) * grid;

    // 1. Atualiza o estado local imediatamente para que a mesa apareça no mapa de forma fluida
    setRecursos(recursosAnteriores =>
      recursosAnteriores.map(rec =>
        rec.id === draggedResourceId
          ? { 
              ...rec, 
              pos_x: snappedX, 
              pos_y: snappedY 
            }
          : rec
      )
    );

    // 2. Dispara o pedido HTTP PUT para gravar as coordenadas arredondadas na base de dados
    salvarCoordenadasNaBD(draggedResourceId, snappedX, snappedY);
    
    // Limpa o ID do recurso arrastado
    setDraggedResourceId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* BARRA LATERAL: Lista de recursos que ainda NÃO têm coordenadas atribuídas */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-[500px] overflow-y-auto">
        <h4 className="font-semibold text-gray-700 mb-3 text-sm border-b pb-2">Mesas / Salas Disponíveis</h4>
        <div className="space-y-2">
          
          {/* Filtramos a lista exibindo apenas os recursos onde pos_x é nulo ou indefinido */}
          {recursos.filter(r => r.pos_x === null || r.pos_x === undefined).map(recurso => (
            <div
              key={recurso.id}
              draggable // Permite que o elemento seja arrastado
              onDragStart={() => handleStageDragStart(recurso.id)}
              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-500 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-medium text-gray-800 block text-sm">{recurso.name}</span>
                <span className="text-xs text-gray-400 capitalize">{recurso.type}</span>
              </div>
              <div className="bg-blue-50 text-blue-600 p-1 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
            </div>
          ))}
          
          {/* Mensagem caso já não existam recursos por posicionar */}
          {recursos.filter(r => r.pos_x === null || r.pos_x === undefined).length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">Todos os recursos já se encontram posicionados no mapa.</p>
          )}
        </div>
      </div>

      {/* CONTENTOR DO MAPA: Zona onde o Stage do Konva vai estar */}
      <div 
        className="lg:col-span-3 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden relative flex justify-center items-center h-[500px]"
        onDragOver={(e) => e.preventDefault()} // Obrigatório para permitir que o evento onDrop funcione
        onDrop={handleStageDrop}
      >
        {/* Stage define a área visível e o sistema de coordenadas do Canvas (800x500 pixéis por agora) */}
        <Stage width={800} height={500} ref={stageRef} className="bg-white shadow-inner">
          {/* O Konva exige que todos os elementos visuais estejam dentro de um Layer (Camada) */}
          <Layer>
            {/* Imagem de fundo da planta */}
            {imageObj && (
              <Image
                image={imageObj}
                width={800} 
                height={500} 
                opacity={0.5} // torna a planta mais clara para destacar as mesas etc.
              />
            )}

            {/* Mapeamos e desenhamos apenas os recursos que já têm coordenadas válidas */}
            {recursos.filter(r => r.pos_x !== null && r.pos_x !== undefined).map(recurso => (
              <Group
                key={recurso.id}
                x={recurso.pos_x}
                y={recurso.pos_y}
                rotation={recurso.rotation || 0}
                draggable // Torna o elemento arrastável livremente dentro do próprio Canvas
                
                // Evento disparado quando o utilizador larga o objeto após arrastá-lo no mapa
                onDragEnd={(e) => {
                  const grid = 25; // tamanho da grelha
                  const node=e.target;
                  // Captura as novas coordenadas X e Y relativas ao Stage
                  const novoX = Math.round(node.x() / grid) * grid;
                  const novoY = Math.round(node.y() / grid) * grid;

                  // Atualiza a posição do objeto no mapa para a posição "encaixada" na grelha
                  node.position({ x: novoX, y: novoY });

                  // Atualiza a base de dados de imediato para manter o estado persistente
                  const rotacaoAtual = recurso.rotation || 0;
                  salvarCoordenadasNaBD(recurso.id, novoX, novoY, rotacaoAtual);
                }}
              >
                {/* Formato físico da mesa/sala (Retângulo azul com cantos arredondados por agora) */}
                <Rect 
                  width={60} 
                  height={40} 
                  fill="#2563eb" 
                  cornerRadius={4} 
                  shadowBlur={5} 
                  shadowOpacity={0.2} 
                />
                
                {/* Texto centralizado contendo o identificador ou nome do recurso */}
                <Text 
                  text={recurso.name} 
                  fontSize={10} 
                  fill="white" 
                  width={60} 
                  padding={5}
                  align="center"
                  verticalAlign="middle"
                  height={40}
                />
                {/* BOTÃO RODAR (Círculo azul claro no canto inferior direito) */}
                <Group
                  x={45} y={25}
                  onClick={() => {
                    const novaRotacao = ((recurso.rotation || 0) + 90) % 360;
                    salvarCoordenadasNaBD(recurso.id, recurso.pos_x, recurso.pos_y, novaRotacao);
                  }}
                >
                  <Rect width={18} height={18} fill="#60a5fa" cornerRadius={9} />
                  <Text text="↻" fill="white" fontSize={14} width={18} align="center" y={0} />
                </Group>

                {/* BOTÃO REMOVER (Círculo branco com borda vermelha no topo direito) */}
                <Group
                  x={45} y={-5}
                  onClick={() => salvarCoordenadasNaBD(recurso.id, null, null, 0)}
                >
                  <Rect width={18} height={18} fill="white" stroke="#ef4444" strokeWidth={1} cornerRadius={9} />
                  <Text text="×" fill="#ef4444" fontSize={16} width={18} align="center" y={-2} fontStyle="bold" />
                </Group>
              </Group>
            ))}
            
          </Layer>
        </Stage>
      </div>

    </div>
  );
}

export default PlantaEditor;