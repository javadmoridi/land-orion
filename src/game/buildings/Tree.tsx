import {
  formatDuration,
  isNodeAvailable,
  useNow,
  useResourceNodes,
} from '../resourceNodesStore';
import { GRID_SIZE } from '../placementGridUtil';

const TREE_IMAGE = '/assets/tree.png';
const TREE_CUT_IMAGE = '/assets/tree-cut.png';

interface Props {
  x: number;
  y: number;
}

const WIDTH = 5;
const HEIGHT = 5;

/** A tree on the island. Needs the Orion Axe to cut; regrows after 2 hours. */
export function Tree({ x, y }: Props) {
  const nodeId = `tree-${x}-${y}`;
  const node = useResourceNodes((s) => s.nodes.find((n) => n.id === nodeId));
  const harvest = useResourceNodes((s) => s.harvest);
  const now = useNow(1000);

  if (!node) return null;

  const available = isNodeAvailable(node, now);
  const remaining = Math.max(0, node.readyAt - now);

  return (
    <div
      onClick={() => harvest(node.id)}
      style={{
        position: 'absolute',
        left: `${(x / GRID_SIZE) * 100}%`,
        top: `${(y / GRID_SIZE) * 100}%`,
        width: `${(WIDTH / GRID_SIZE) * 100}%`,
        height: `${(HEIGHT / GRID_SIZE) * 100}%`,
        zIndex: 3,
        cursor: available ? 'pointer' : 'default',
        opacity: available ? 1 : 0.5,
        filter: available ? 'none' : 'grayscale(0.9)',
      }}
    >
      <img
        src={available ? TREE_IMAGE : TREE_CUT_IMAGE}
        alt="Tree"
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          imageRendering: 'pixelated',
          display: 'block',
        }}
      />

      {!available && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            textAlign: 'center',
            fontSize: '0.6rem',
            color: 'white',
            textShadow: '0 0 3px black',
            background: 'rgba(0,0,0,.5)',
            borderRadius: 4,
          }}
        >
          ⏳ {formatDuration(remaining)}
        </div>
      )}
    </div>
  );
}