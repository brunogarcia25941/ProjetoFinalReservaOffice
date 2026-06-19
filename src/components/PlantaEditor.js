import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Image } from 'react-konva';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

function PlantaEditor({ recursos, setRecursos, salvarCoordenadasNaBD, pisoAtual, modoAdmin = false, reservarRecurso, officeName }) {
  const stageRef = useRef(null);
  const containerRef = useRef(null); // Ref para o contentor pai para calcular a posição do tooltip
  const [draggedResourceId, setDraggedResourceId] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Estados para a Tooltip
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const currentOfficeName = officeName || 'Edifício Principal';

  const [layoutConfig, setLayoutConfig] = useState({
    map_image: null,
    map_width: 800,
    map_height: 500,
    walls: []
  });

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
    if (!currentOfficeName) return;
    api.get(`/offices/layout?office_name=${encodeURIComponent(currentOfficeName)}&floor=${pisoAtual}`)
      .then(response => {
        setLayoutConfig(response.data);
        if (response.data.map_image) {
          const img = new window.Image();
          img.src = response.data.map_image;
          img.onload = () => {
            setImageObj(img);
          };
        } else {
          // Fallback para a planta estática
          const img = new window.Image();
          img.src = `/planta${pisoAtual}.png`;
          img.onload = () => {
            setImageObj(img);
          };
        }
      })
      .catch(error => {
        console.error("Erro ao carregar layout do escritório:", error);
        // Fallback
        const img = new window.Image();
        img.src = `/planta${pisoAtual}.png`;
        img.onload = () => {
          setImageObj(img);
          setLayoutConfig({
            map_image: null,
            map_width: 800,
            map_height: 500,
            walls: []
          });
        };
      });
  }, [currentOfficeName, pisoAtual]);

  const handleMapImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setLayoutConfig(prev => ({
        ...prev,
        map_image: base64Data
      }));
      const img = new window.Image();
      img.src = base64Data;
      img.onload = () => {
        setImageObj(img);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLayout = async () => {
    try {
      await api.post('/offices/layout', {
        office_name: currentOfficeName,
        floor: pisoAtual,
        map_image: layoutConfig.map_image,
        map_width: layoutConfig.map_width,
        map_height: layoutConfig.map_height,
        walls: layoutConfig.walls
      });
      toast.success("Layout do mapa guardado com sucesso!");
    } catch (error) {
      console.error("Erro ao guardar layout do mapa:", error);
      toast.error("Erro ao guardar o layout do mapa.");
    }
  };

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
    <div className="space-y-4 w-full">
      {/* Painel do Administrador para Edição da Planta */}
      {modoAdmin && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between z-20 relative">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Upload mapa */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Carregar Imagem da Planta (PNG/JPG/Base64)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMapImageUpload}
                className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-soft file:text-primary hover:file:bg-primary-soft/80 cursor-pointer"
              />
            </div>
            
            {/* Largura */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Largura (px)</label>
              <input
                type="number"
                value={layoutConfig.map_width}
                onChange={(e) => setLayoutConfig(prev => ({ ...prev, map_width: parseInt(e.target.value) || 800 }))}
                className="w-24 text-xs border rounded p-2"
              />
            </div>

            {/* Altura */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Altura (px)</label>
              <input
                type="number"
                value={layoutConfig.map_height}
                onChange={(e) => setLayoutConfig(prev => ({ ...prev, map_height: parseInt(e.target.value) || 500 }))}
                className="w-24 text-xs border rounded p-2"
              />
            </div>

            {/* Adicionar parede */}
            <button
              type="button"
              onClick={() => {
                const newWall = {
                  id: 'wall_' + Date.now(),
                  x: 100,
                  y: 100,
                  width: 150,
                  height: 15,
                  rotation: 0
                };
                setLayoutConfig(prev => ({
                  ...prev,
                  walls: [...(prev.walls || []), newWall]
                }));
              }}
              className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors self-end h-[38px]"
            >
              <span>+ Adicionar Parede</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveLayout}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-colors self-end h-[38px]"
          >
            Guardar Configuração da Planta
          </button>
        </div>
      )}

      <div className={modoAdmin ? "grid grid-cols-1 lg:grid-cols-4 gap-6 relative" : "w-full relative"} ref={containerRef}>
        
        {/* Tooltip HTML renderizada por cima do canvas */}
        {tooltipData && !draggedResourceId && (
          <div 
            className="absolute z-50 bg-white px-3 py-2 rounded-lg shadow-xl border border-gray-200 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 animate-fade-in"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 10 }}
          >
            <div className="font-bold text-gray-800 text-sm flex items-center gap-1">
              {(() => {
                let featuresObj = {};
                if (tooltipData.features) {
                  try {
                    featuresObj = typeof tooltipData.features === 'string' ? JSON.parse(tooltipData.features) : tooltipData.features;
                  } catch(e) {}
                }
                return !!featuresObj.accessible && <span title="Lugar Acessível (PMR)" className="text-blue-500 font-semibold">♿</span>;
              })()}
              {tooltipData.name}
            </div>
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
          className={modoAdmin ? "lg:col-span-3 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-auto relative flex items-center justify-start lg:justify-center p-2" : "w-full rounded-xl border-2 border-dashed border-gray-300 overflow-auto relative flex items-center justify-start lg:justify-center p-2"}
          style={{ height: `${layoutConfig.map_height + 40}px` }}
          onDragOver={(e) => e.preventDefault()} 
          onDrop={handleStageDrop}
        >
          <div style={{ minWidth: `${layoutConfig.map_width}px`, height: `${layoutConfig.map_height}px` }} className="shadow-md rounded-lg overflow-hidden border border-gray-200">
            <Stage
              width={layoutConfig.map_width}
              height={layoutConfig.map_height}
              ref={stageRef}
              className="bg-white cursor-grab active:cursor-grabbing"
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
                    width={layoutConfig.map_width}
                    height={layoutConfig.map_height}
                    opacity={0.5} 
                  />
                )}

                {/* Desenhar Paredes */}
                {(layoutConfig.walls || []).map(wall => (
                  <Group
                    key={wall.id}
                    x={wall.x}
                    y={wall.y}
                    rotation={wall.rotation || 0}
                    draggable={modoAdmin}
                    onDragEnd={(e) => {
                      if (!modoAdmin) return;
                      const node = e.target;
                      const grid = 25;
                      const snappedX = Math.round(node.x() / grid) * grid;
                      const snappedY = Math.round(node.y() / grid) * grid;
                      node.position({ x: snappedX, y: snappedY });
                      setLayoutConfig(prev => ({
                        ...prev,
                        walls: prev.walls.map(w => w.id === wall.id ? { ...w, x: snappedX, y: snappedY } : w)
                      }));
                    }}
                  >
                    <Rect
                      width={wall.width}
                      height={wall.height}
                      fill="#4b5563"
                      stroke="#1f2937"
                      strokeWidth={1}
                      opacity={0.85}
                      cornerRadius={2}
                    />
                    {modoAdmin && (
                      <>
                        {/* Botão Eliminar Parede (Vermelho) */}
                        <Group
                          x={wall.width - 25}
                          y={-22}
                          onClick={() => {
                            setLayoutConfig(prev => ({
                              ...prev,
                              walls: prev.walls.filter(w => w.id !== wall.id)
                            }));
                          }}
                        >
                          <Rect width={18} height={18} fill="#ef4444" cornerRadius={9} />
                          <Text text="×" fill="white" fontSize={14} width={18} align="center" y={0} fontStyle="bold" />
                        </Group>

                        {/* Botão Rodar Parede (Azul) */}
                        <Group
                          x={wall.width - 5}
                          y={-22}
                          onClick={() => {
                            setLayoutConfig(prev => ({
                              ...prev,
                              walls: prev.walls.map(w => w.id === wall.id ? { ...w, rotation: ((w.rotation || 0) + 90) % 360 } : w)
                            }));
                          }}
                        >
                          <Rect width={18} height={18} fill="#3b82f6" cornerRadius={9} />
                          <Text text="↻" fill="white" fontSize={12} width={18} align="center" y={2} />
                        </Group>

                        {/* Botão Largura Parede (Verde) */}
                        <Group
                          x={wall.width + 15}
                          y={-22}
                          onClick={() => {
                            const newWidth = prompt("Introduza a largura da parede (px):", wall.width) || wall.width;
                            setLayoutConfig(prev => ({
                              ...prev,
                              walls: prev.walls.map(w => w.id === wall.id ? { ...w, width: parseInt(newWidth) || w.width } : w)
                            }));
                          }}
                        >
                          <Rect width={18} height={18} fill="#10b981" cornerRadius={9} />
                          <Text text="↔" fill="white" fontSize={12} width={18} align="center" y={2} />
                        </Group>

                        {/* Botão Espessura Parede (Laranja) */}
                        <Group
                          x={wall.width + 35}
                          y={-22}
                          onClick={() => {
                            const newHeight = prompt("Introduza a espessura da parede (px):", wall.height) || wall.height;
                            setLayoutConfig(prev => ({
                              ...prev,
                              walls: prev.walls.map(w => w.id === wall.id ? { ...w, height: parseInt(newHeight) || w.height } : w)
                            }));
                          }}
                        >
                          <Rect width={18} height={18} fill="#f59e0b" cornerRadius={9} />
                          <Text text="↕" fill="white" fontSize={12} width={18} align="center" y={2} />
                        </Group>
                      </>
                    )}
                  </Group>
                ))}

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
                          x={recurso.type === 'room' ? 95 : 35} y={recurso.type === 'room' ? 55 : 15}
                          onClick={() => {
                            const novaRotacao = ((recurso.rotation || 0) + 90) % 360;
                            salvarCoordenadasNaBD(recurso.id, recurso.pos_x, recurso.pos_y, novaRotacao);
                          }}
                        >
                          <Rect width={18} height={18} fill="#60a5fa" cornerRadius={9} />
                          <Text text="↻" fill="white" fontSize={14} width={18} align="center" y={0} />
                        </Group>

                        <Group
                          x={recurso.type === 'room' ? 95 : 35} y={recurso.type === 'room' ? -15 : -15}
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
      </div>
    </div>
  );
}

export default PlantaEditor;