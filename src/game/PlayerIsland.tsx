import { useEffect } from 'react';

import { OrionHouse } from './OrionHouse';
import { PlacementGrid } from './PlacementGrid';
import { SeedNest } from './SeedNest';
import { EggShop } from './EggShop';

import { Barracks } from './buildings/Barracks';
import { Incubator } from './buildings/Incubator';
import { OrionSupply } from './buildings/OrionSupply';
import { Hospital } from './buildings/Hospital';

import { Tree } from './buildings/Tree';
import { MineNode } from './buildings/MineNode';

import { Miner } from './ActionBuildings';

import { useResourceNodes } from './resourceNodesStore';
import { useFarmStore } from './farmStore';
import { Farmland } from './buildings/Farmland';

const LAND_MAP_IMAGE = '/assets/land-map.png';

interface PlayerIslandProps {
  level: number;
  resources?: Record<string, number>;
  inventory?: Array<{
    id: string;
    quantity: number;
  }>;
}

export function PlayerIsland(
  _props: PlayerIslandProps
) {
  const nodes = useResourceNodes(
    (s) => s.nodes
  );

  const message = useResourceNodes(
    (s) => s.message
  );

  const clearMessage =
    useResourceNodes(
      (s) => s.clearMessage
    );

  const farms = useFarmStore(
    (s) => s.tiles
  );

  const farmMessage =
    useFarmStore(
      (s) => s.message
    );

  const clearFarmMessage =
    useFarmStore(
      (s) => s.clearMessage
    );

  useEffect(() => {
    if (!message) return;

    const t = window.setTimeout(
      clearMessage,
      3000
    );

    return () =>
      window.clearTimeout(t);
  }, [
    message,
    clearMessage,
  ]);

  useEffect(() => {
    if (!farmMessage) return;

    const t = window.setTimeout(
      clearFarmMessage,
      3000
    );

    return () =>
      window.clearTimeout(t);
  }, [
    farmMessage,
    clearFarmMessage,
  ]);

  const trees = nodes.filter(
    (n) => n.kind === 'tree'
  );

  const mines = nodes.filter(
    (n) => n.kind !== 'tree'
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <img
        src={LAND_MAP_IMAGE}
        alt="Island"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          imageRendering: 'pixelated',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '3%',
            right: '3%',
            bottom: 0,
          }}
        >
          <PlacementGrid showGrid={false}>

            <OrionHouse
              subX={0}
              subY={1}
            />

            <Barracks
              x={10}
              y={1}
            />

            <SeedNest
              x={20}
              y={1}
            />

            <EggShop
              x={0}
              y={11}
            />

            <Incubator
              x={10}
              y={11}
            />

            <OrionSupply
              x={20}
              y={11}
            />

            {/* Hospital */}
            <Hospital
              x={29}
              y={17}
            />

            {/* Miner */}
            <Miner
              x={18}
              y={30}
            />

            {/* Trees */}
            {trees.map((tree) => (
              <Tree
                key={tree.id}
                x={tree.x}
                y={tree.y}
              />
            ))}

            {/* Minerals */}
            {mines.map((mine) => (
              <MineNode
                key={mine.id}
                nodeId={mine.id}
              />
            ))}

            {/* Farmland */}
            {farms.map((farm) => (
              <Farmland
                key={farm.id}
                tileId={farm.id}
              />
            ))}

          </PlacementGrid>
        </div>
      </div>

      {message && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform:
              'translateX(-50%)',
            zIndex: 10000,
            background:
              'rgba(0,0,0,.85)',
            color: '#ffd700',
            padding: '10px 18px',
            borderRadius: 10,
            border:
              '1px solid #ffd700',
            fontWeight: 700,
            pointerEvents: 'none',
          }}
        >
          {message}
        </div>
      )}

      {farmMessage && (
        <div
          style={{
            position: 'fixed',
            top: 64,
            left: '50%',
            transform:
              'translateX(-50%)',
            zIndex: 10000,
            background:
              'rgba(0,0,0,.85)',
            color: '#90ee90',
            padding: '10px 18px',
            borderRadius: 10,
            border:
              '1px solid #90ee90',
            fontWeight: 700,
            pointerEvents: 'none',
          }}
        >
          {farmMessage}
        </div>
      )}
    </div>
  );
}