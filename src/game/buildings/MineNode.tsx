import {
  formatDuration,
  isNodeAvailable,
  NODE_IMAGE,
  NODE_LABEL,
  useNow,
  useResourceNodes,
} from '../resourceNodesStore';
import { GRID_SIZE } from '../placementGridUtil';

interface Props {
  nodeId: string;
}

/** A mineral node on the ground (2x2 footprint). */
export function MineNode({ nodeId }: Props) {
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
        left: `${(node.x / GRID_SIZE) * 100}%`,
        top: `${(node.y / GRID_SIZE) * 100}%`,
        width: `${(node.size / GRID_SIZE) * 100}%`,
        height: `${(node.size / GRID_SIZE) * 100}%`,
        zIndex: 3,
        cursor: available ? 'pointer' : 'default',
        opacity: available ? 1 : 0.45,
        filter: available ? 'none' : 'grayscale(0.9)',
      }}
    >
      <img
        src={NODE_IMAGE[node.kind]}
        alt={NODE_LABEL[node.kind]}
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
            fontSize: '0.6rem',
            color: 'white',
            textShadow: '0 0 3px black',
            background: 'rgba(0,0,0,.5)',
            borderRadius: 4,
            padding: '0 3px',
          }}
        >
          ⏳ {formatDuration(remaining)}
        </div>
      )}
    </div>
  );
}