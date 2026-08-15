import { useEffect, useState } from 'react';

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


const LAND_MAP_IMAGE =
  '/assets/land-map.png';


interface PlayerIslandProps {
  level: number;

  resources?: Record<
    string,
    number
  >;

  inventory?: Array<{
    id: string;
    quantity: number;
  }>;
}


export function PlayerIsland(
  _props: PlayerIslandProps
) {

  const [
    zoom,
    setZoom,
  ] = useState(1);


  const nodes =
    useResourceNodes(
      s => s.nodes
    );


  const message =
    useResourceNodes(
      s => s.message
    );


  const clearMessage =
    useResourceNodes(
      s => s.clearMessage
    );


  const farms =
    useFarmStore(
      s => s.tiles
    );


  const farmMessage =
    useFarmStore(
      s => s.message
    );


  const clearFarmMessage =
    useFarmStore(
      s => s.clearMessage
    );


  useEffect(() => {

    if (!message) {
      return;
    }


    const timer =
      window.setTimeout(
        clearMessage,
        3000
      );


    return () =>
      clearTimeout(timer);

  }, [
    message,
    clearMessage,
  ]);


  useEffect(() => {

    if (!farmMessage) {
      return;
    }


    const timer =
      window.setTimeout(
        clearFarmMessage,
        3000
      );


    return () =>
      clearTimeout(timer);

  }, [
    farmMessage,
    clearFarmMessage,
  ]);


  const trees =
    nodes.filter(
      node =>
        node.kind === 'tree'
    );


  const mines =
    nodes.filter(
      node =>
        node.kind !== 'tree'
    );


  return (

    <div
      style={{
        position: 'fixed',

        inset: 0,

        overflow: 'hidden',

        background: '#111',

        touchAction: 'none',
      }}
    >

      {/* =========================================================
          ZOOM CONTROLS
          ========================================================= */}

      <div
        style={{
          position: 'fixed',

          right: 15,

          bottom: 15,

          zIndex: 99999,

          display: 'flex',

          flexDirection: 'column',

          gap: 8,
        }}
      >

        <button
          type="button"
          onClick={() =>
            setZoom(
              value =>
                Math.min(
                  value + 0.1,
                  2
                )
            )
          }
          style={{
            width: 45,

            height: 45,

            borderRadius: 10,

            border: 'none',

            background: '#ffd700',

            fontSize: 25,

            fontWeight: 900,

            cursor: 'pointer',
          }}
        >
          +
        </button>


        <button
          type="button"
          onClick={() =>
            setZoom(
              value =>
                Math.max(
                  value - 0.1,
                  0.7
                )
            )
          }
          style={{
            width: 45,

            height: 45,

            borderRadius: 10,

            border: 'none',

            background: '#ffd700',

            fontSize: 25,

            fontWeight: 900,

            cursor: 'pointer',
          }}
        >
          -
        </button>

      </div>


      {/* =========================================================
          MAP SCROLLER
          ========================================================= */}

      <div
        style={{
          position: 'absolute',

          inset: 0,

          overflow: 'auto',
        }}
      >

        <div
          style={{
            position: 'relative',

            width: '100%',

            height: '100%',

            transform:
              `scale(${zoom})`,

            transformOrigin:
              'center center',
          }}
        >

          {/* =====================================================
              LAND MAP
              ===================================================== */}

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

              imageRendering:
                'pixelated',

              pointerEvents:
                'none',

              zIndex: 0,
            }}
          />


          <div
            style={{
              position: 'absolute',

              inset: 0,

              zIndex: 2,
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

              <PlacementGrid
                showGrid={false}
              >

                {/* =================================================
                    TOP BUILDINGS
                    ================================================= */}

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


                {/* =================================================
                    MIDDLE BUILDINGS
                    ================================================= */}

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


                {/* =================================================
                    MINER
                    ================================================= */}

                <Miner
                  x={18}
                  y={30}
                />


                {/* =================================================
                    TREES
                    Bottom-right
                    ================================================= */}

                {
                  trees.map(
                    tree => (

                      <Tree
                        key={tree.id}
                        x={tree.x}
                        y={tree.y}
                      />

                    )
                  )
                }


                {/* =================================================
                    HOSPITAL

                    Hospital is intentionally placed in the
                    central area between the farmland and trees.

                    It is NOT placed on top of the Miner or
                    mineral nodes.
                    ================================================= */}

                <Hospital
                  x={32}
                  y={15}
                />


                {/* =================================================
                    MINERAL NODES
                    Bottom-left
                    ================================================= */}

                {
                  mines.map(
                    mine => (

                      <MineNode
                        key={mine.id}
                        nodeId={mine.id}
                      />

                    )
                  )
                }


                {/* =================================================
                    FARMLAND
                    Top-right
                    ================================================= */}

                {
                  farms.map(
                    farm => (

                      <Farmland
                        key={farm.id}
                        tileId={farm.id}
                      />

                    )
                  )
                }


              </PlacementGrid>

            </div>

          </div>

        </div>

      </div>


      {/* =========================================================
          RESOURCE MESSAGE
          ========================================================= */}

      {
        message && (

          <div
            style={{
              position: 'fixed',

              top: 20,

              left: '50%',

              transform:
                'translateX(-50%)',

              zIndex: 100000,

              background:
                'rgba(0,0,0,.85)',

              color: '#ffd700',

              padding:
                '10px 18px',

              borderRadius: 10,
            }}
          >
            {message}
          </div>

        )
      }


      {/* =========================================================
          FARM MESSAGE
          ========================================================= */}

      {
        farmMessage && (

          <div
            style={{
              position: 'fixed',

              top: 70,

              left: '50%',

              transform:
                'translateX(-50%)',

              zIndex: 100000,

              background:
                'rgba(0,0,0,.85)',

              color: '#90ee90',

              padding:
                '10px 18px',

              borderRadius: 10,
            }}
          >
            {farmMessage}
          </div>

        )
      }

    </div>

  );
}