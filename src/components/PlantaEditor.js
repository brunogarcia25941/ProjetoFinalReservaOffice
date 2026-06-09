import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Image } from 'react-konva';

function PlantaEditor({ recursos, setRecursos, salvarCoordenadasNaBD, pisoAtual, modoAdmin = false, reservarRecurso }) {
  const stageRef = useRef(null);
  const containerRef = useRef(null); // Ref para o contentor pai para calcular a posição do tooltip
  const [draggedResourceId, setDraggedResourceId] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Estados para a Tooltip
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1; 
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale < 0.5 || newScale > 3) return;

    setScale(newScale);
    setPosition({
      x: (stage.getPointerPosition().x / newScale - mousePointTo.x) * newScale,
      y: (stage.getPointerPosition().y / newScale - mousePointTo.y) * newScale,
    });
  };

  useEffect(() => {
    const img = new window.Image();
    img.src = `/planta${pisoAtual}.png`; 
    img.onload = () => {
      setImageObj(img);
    };
  }, [pisoAtual]);

  const handleStageDragStart = (id) => {
    setDraggedResourceId(id);
  };

  const handleStageDrop = (e) => {
    e.preventDefault();
    if (!draggedResourceId) return;

    stageRef.current.setPointersPositions(e);
    const pointerPosition = stageRef.current.getPointerPosition();

    const grid = 25; 
    const snappedX = Math.round(pointerPosition.x / grid) * grid;
    const snappedY = Math.round(pointerPosition.y / grid) * grid;

    setRecursos(recursosAnteriores =>
      recursosAnteriores.map(rec =>
        rec.id === draggedResourceId
          ? { ...rec, pos_x: snappedX, pos_y: snappedY }
          : rec
      )
    );

    salvarCoordenadasNaBD(draggedResourceId, snappedX, snappedY);
    setDraggedResourceId(null);
  };

  return (
    <div className={modoAdmin ? "grid grid-cols-1 lg:grid-cols-4 gap-6 relative" : "w-full relative"} ref={containerRef}>
      
      {/* Tooltip HTML renderizada por cima do canvas */}
      {tooltipData && !draggedResourceId && (
        <div 
          className="absolute z-50 bg-white px-3 py-2 rounded-lg shadow-xl border border-gray-200 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 animate-fade-in"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 10 }}
        >
          <div className="font-bold text-gray-800 text-sm">{tooltipData.name}</div>
          <div className="text-xs text-gray-500 capitalize">{tooltipData.type === 'desk' ? 'Mesa' : tooltipData.type} - Piso {tooltipData.floor}</div>
          
          <div className="mt-2 border-t pt-2">
            {tooltipData.status === 'maintenance' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                Em Manutenção
              </span>
            ) : tooltipData.is_booked ? (
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-admin bg-admin-soft px-2 py-1 rounded-md border border-admin-light w-max">
                  <span className="w-2 h-2 rounded-full bg-admin"></span>
                  Ocupado
                </span>
                {tooltipData.booked_by_user && (
                  <span className="text-xs text-gray-700 font-medium">Por: {tooltipData.booked_by_user}</span>
                )}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success bg-success-soft px-2 py-1 rounded-md border border-success-light">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                Livre para Reservar
              </span>
            )}
          </div>
          
          {/* Seta do tooltip */}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
        </div>
      )}

      {modoAdmin && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-[500px] overflow-y-auto relative z-10">
          <h4 className="font-semibold text-gray-700 mb-3 text-sm border-b pb-2">Mesas / Salas Disponíveis</h4>
          <div className="space-y-2">
            {recursos.filter(r => r.pos_x === null || r.pos_x === undefined).map(recurso => (
              <div
                key={recurso.id}
                draggable
                onDragStart={() => handleStageDragStart(recurso.id)}
                className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-500 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-gray-800 block text-sm">{recurso.name}</span>
                  <span className="text-xs text-gray-400 capitalize">{recurso.type}</span>
                </div>
                <div className="bg-primary-soft text-primary p-1 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </div>
              </div>
            ))}
            {recursos.filter(r => r.pos_x === null || r.pos_x === undefined).length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Todos os recursos já se encontram posicionados no mapa.</p>
            )}
          </div>
        </div>
      )}

      <div
        className={modoAdmin ? "lg:col-span-3 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden relative flex justify-center items-center h-[500px] " : "w-full  rounded-xl border-2 border-dashed border-gray-300 overflow-hidden relative flex justify-center items-center h-[500px]"}
        onDragOver={(e) => e.preventDefault()} 
        onDrop={handleStageDrop}
      >
        <Stage
          width={800}
          height={500}
          ref={stageRef}
          className="bg-white shadow-inner cursor-grab active:cursor-grabbing"
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          onWheel={handleWheel}
          draggable={!draggedResourceId} 
          onDragEnd={(e) => {
            if (e.target === stageRef.current) {
              setPosition({ x: e.target.x(), y: e.target.y() });
            }
          }}
        >
          <Layer>
            {imageObj && (
              <Image
                image={imageObj}
                width={800}
                height={500}
                opacity={0.5} 
              />
            )}

            {recursos.filter(r => r.pos_x !== null && r.pos_x !== undefined).map(recurso => (
              <Group
                key={recurso.id}
                x={recurso.pos_x}
                y={recurso.pos_y}
                rotation={recurso.rotation || 0}
                draggable={modoAdmin} 

                onDragEnd={(e) => {
                  if (!modoAdmin) return;
                  const grid = 25; 
                  const node = e.target;
                  const novoX = Math.round(node.x() / grid) * grid;
                  const novoY = Math.round(node.y() / grid) * grid;

                  node.position({ x: novoX, y: novoY });

                  const rotacaoAtual = recurso.rotation || 0;
                  salvarCoordenadasNaBD(recurso.id, novoX, novoY, rotacaoAtual);
                }}

                onClick={() => {
                  if (!modoAdmin && !recurso.is_booked && recurso.status === 'active') {
                    reservarRecurso(recurso.id, recurso.name);
                  }
                }}

                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  const container = stage.container();
                  
                  // Mudar cursor se puder reservar
                  if (!modoAdmin && !recurso.is_booked && recurso.status === 'active') {
                    container.style.cursor = 'pointer';
                  }

                  // Calcular posição do rato relativa ao contentor DOM
                  if (containerRef.current) {
                    const pointerPos = stage.getPointerPosition();
                    // Como a div do stage pode ter margens/padding ou estar ao lado da sidebar no admin,
                    // calculamos a posição absoluta relativa ao wrapper mais próximo.
                    const stageBox = container.getBoundingClientRect();
                    const parentBox = containerRef.current.getBoundingClientRect();
                    
                    setTooltipPos({
                      x: pointerPos.x + (stageBox.left - parentBox.left),
                      y: pointerPos.y + (stageBox.top - parentBox.top)
                    });
                    setTooltipData(recurso);
                  }
                }}
                
                onMouseLeave={(e) => {
                  e.target.getStage().container().style.cursor = 'default';
                  setTooltipData(null);
                }}
              >
                <Rect
                  width={recurso.type === 'room' ? 120 : 60}
                  height={recurso.type === 'room' ? 80 : 40}
                  fill={recurso.status === 'maintenance' ? '#dc2626' : (recurso.is_booked ? '#9ca3af' : '#16a34a')}
                  cornerRadius={4}
                  shadowBlur={5}
                  shadowOpacity={0.2}
                  stroke={recurso.status === 'maintenance' ? '#991b1b' : (recurso.is_booked ? '#4b5563' : '#15803d')}
                  strokeWidth={1}
                />

                <Text
                  text={recurso.name}
                  fontSize={10}
                  fill="white"
                  listening={false}
                  width={recurso.type === 'room' ? 120 : 60}
                  height={recurso.type === 'room' ? 80 : 40}
                  padding={5}
                  align="center"
                  verticalAlign="middle"
                />
                
                {modoAdmin && (
                  <>
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

                    <Group
                      x={45} y={-5}
                      onClick={() => salvarCoordenadasNaBD(recurso.id, null, null, 0)}
                    >
                      <Rect width={18} height={18} fill="white" stroke="#ef4444" strokeWidth={1} cornerRadius={9} />
                      <Text text="×" fill="#ef4444" fontSize={16} width={18} align="center" y={-2} fontStyle="bold" />
                    </Group>
                  </>
                )}
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default PlantaEditor;