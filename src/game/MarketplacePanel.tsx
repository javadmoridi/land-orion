import { useMemo, useState, useCallback, useEffect } from 'react';

import { useOrionStore } from './orionStore';
import { useResourceStore } from '../economy/resourceStore';
import { useGameStore } from './useGameStore';
import {
  ORION_MAX_LEVEL,
  ORION_RACES,
} from './orionStore';
import type {
  OrionRace,
} from './orionStore';
import {
  getListings,
  createListing,
  buyListing,
} from '../backend/marketplaceApi';

interface MarketplacePanelProps {
  open: boolean;
  onClose: () => void;
}

type ResourceCategory =
  | 'wood'
  | 'stone'
  | 'iron'
  | 'gold'
  | 'crystal'
  | 'water'
  | 'earth'
  | 'fire'
  | 'air';

type FruitCategory =
  `fruit-${number}`;

type CategoryId =
  | ResourceCategory
  | FruitCategory
  | 'coming-soon';

interface Category {
  id: CategoryId;
  label: string;
  locked?: boolean;
}

interface Listing {
  id: string;
  listingId?: number;
  sellerId?: string;
  seller: string;
  itemName: string;
  itemId: string;
  quantity: number;
  price: number;
}

interface OrionListing {
  id: string;
  listingId?: number;
  sellerId?: string;
  seller: string;
  race: OrionRace;
  level: number;
  attack: number;
  hp: number;
  price: number;
}

type MarketSelection =
  | {
      type: 'category';
      id: CategoryId;
    }
  | {
      type: 'orion';
      race: OrionRace;
    };

type SellTarget =
  | {
      type: 'item';
      itemId: string;
      itemName: string;
      available: number;
    }
  | {
      type: 'orion';
      race: OrionRace;
      level: number;
      available: number;
      attack: number;
      hp: number;
    };

const MUNICIPAL_TAX_RATE = 0.05;

const CATEGORIES: Category[] = [
  {
    id: 'wood',
    label: 'WOOD',
  },
  {
    id: 'stone',
    label: 'STONE',
  },
  {
    id: 'iron',
    label: 'IRON',
  },
  {
    id: 'gold',
    label: 'GOLD',
  },
  {
    id: 'crystal',
    label: 'CRYSTAL',
  },
  {
    id: 'water',
    label: 'WATER',
  },
  {
    id: 'earth',
    label: 'EARTH',
  },
  {
    id: 'fire',
    label: 'FIRE',
  },
  {
    id: 'air',
    label: 'AIR',
  },
  ...Array.from(
    {
      length: 10,
    },
    (_, index) => ({
      id:
        `fruit-${index + 1}` as FruitCategory,
      label:
        `FRUITS ${index + 1}`,
    })
  ),
  {
    id: 'coming-soon',
    label: 'COMING SOON',
    locked: true,
  },
];

const DEMO_LISTINGS: Record<
  CategoryId,
  Listing[]
> = {
  wood: [
    {
      id: 'wood-1',
      seller: 'Ali',
      itemName: 'Wood',
      itemId: 'wood',
      quantity: 20,
      price: 15,
    },
    {
      id: 'wood-2',
      seller: 'Reza',
      itemName: 'Wood',
      itemId: 'wood',
      quantity: 50,
      price: 13,
    },
    {
      id: 'wood-3',
      seller: 'Javad',
      itemName: 'Wood',
      itemId: 'wood',
      quantity: 10,
      price: 18,
    },
  ],
  stone: [],
  iron: [],
  gold: [],
  crystal: [],
  water: [],
  earth: [],
  fire: [],
  air: [],
  'fruit-1': [],
  'fruit-2': [],
  'fruit-3': [],
  'fruit-4': [],
  'fruit-5': [],
  'fruit-6': [],
  'fruit-7': [],
  'fruit-8': [],
  'fruit-9': [],
  'fruit-10': [],
  'coming-soon': [],
};

const DEMO_ORION_LISTINGS: Record<
  OrionRace,
  OrionListing[]
> = {
  water: [
    {
      id: 'water-demo-30',
      seller: 'Ali',
      race: 'water',
      level: 30,
      attack: 850.23,
      hp: 850.23,
      price: 500,
    },
  ],
  air: [
    {
      id: 'air-demo-20',
      seller: 'Reza',
      race: 'air',
      level: 20,
      attack: 2580.2,
      hp: 2580.2,
      price: 900,
    },
  ],
  earth: [
    {
      id: 'earth-demo-10',
      seller: 'Javad',
      race: 'earth',
      level: 10,
      attack: 1537.73,
      hp: 1537.73,
      price: 1500,
    },
  ],
  fire: [],
  asil: [],
};

const ORION_BASE_STATS: Record<
  OrionRace,
  number
> = {
  water: 10,
  air: 20,
  earth: 40,
  fire: 100,
  asil: 200,
};

const ORION_NAMES: Record<
  OrionRace,
  string
> = {
  water: 'WATER',
  air: 'AIR',
  earth: 'EARTH',
  fire: 'FIRE',
  asil: 'ASIL',
};

function formatNumber(
  value: number
): string {
  return value.toLocaleString(
    'en-US'
  );
}

function formatStat(
  value: number
): string {
  return value.toLocaleString(
    'en-US',
    {
      maximumFractionDigits: 2,
    }
  );
}

function getOrionStat(
  race: OrionRace,
  level: number
): number {
  return (
    ORION_BASE_STATS[race] *
    Math.pow(1.5, level - 1)
  );
}

function getResourceAmount(
  category: ResourceCategory,
  resources: {
    wood: number;
    stone: number;
    iron: number;
    gold: number;
    crystal: number;
    water: number;
    earth: number;
    fire: number;
    air: number;
  }
): number {
  return Number(
    resources[category] ?? 0
  );
}

type SortKey =
  | 'most-expensive'
  | 'cheapest'
  | 'highest-level'
  | 'lowest-level';

function sortByPrice<T extends {
  price: number;
}>(
  list: T[],
  sortKey: SortKey
): T[] {
  const sorted = [...list].sort(
    (a, b) =>
      a.price - b.price
  );

  if (sortKey === 'cheapest') {
    return sorted;
  }

  return sorted.reverse();
}

function sortOrions(
  list: OrionListing[],
  sortKey: SortKey,
  selectedLevel: number
): OrionListing[] {
  let sorted = [...list];

  if (
    sortKey ===
      'highest-level' ||
    sortKey ===
      'lowest-level'
  ) {
    sorted.sort(
      (a, b) =>
        a.level - b.level
    );

    if (
      sortKey ===
      'highest-level'
    ) {
      sorted = sorted.reverse();
    }

    return sorted.filter(
      (item) =>
        item.level ===
        selectedLevel
    );
  }

  // Price-based sorts. Keep listings at the selected level
  // visible first, then fill with the sorted price order.
  sorted = sorted.filter(
    (item) =>
      item.level ===
      selectedLevel
  );

  return sortByPrice(
    sorted,
    sortKey
  );
}

function getFruitInventory(
  category: FruitCategory,
  inventory: Array<{
    id: string;
    name: string;
    type: string;
    quantity: number;
  }>
) {
  const group = Number(
    category.replace(
      'fruit-',
      ''
    )
  );

  const fruits =
    inventory.filter(
      (item) =>
        item.type === 'fruit'
    );

  const start =
    (group - 1) * 10;

  return fruits.slice(
    start,
    start + 10
  );
}

function getResourceDisplayName(
  category: ResourceCategory
): string {
  return (
    category.charAt(0).toUpperCase() +
    category.slice(1)
  );
}

function CategoryButton({
  category,
  active,
  onClick,
}: {
  category: Category;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        category.locked
      }
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 42,
        border: active
          ? '1px solid rgba(255,215,0,.85)'
          : '1px solid rgba(255,255,255,.12)',
        borderRadius: 999,
        padding:
          '10px 14px',
        background: active
          ? 'rgba(255,215,0,.14)'
          : 'rgba(255,255,255,.04)',
        color: category.locked
          ? '#666'
          : active
          ? '#ffd700'
          : '#fff',
        cursor: category.locked
          ? 'not-allowed'
          : 'pointer',
        fontSize: 12,
        fontWeight: 800,
        opacity: category.locked
          ? 0.5
          : 1,
        textAlign: 'center',
      }}
    >
      {category.label}
    </button>
  );
}

function OrionRaceButton({
  race,
  active,
  onClick,
}: {
  race: OrionRace;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active
          ? '1px solid rgba(255,215,0,.9)'
          : '1px solid rgba(255,255,255,.12)',
        borderRadius: 999,
        padding:
          '9px 15px',
        background: active
          ? 'rgba(255,215,0,.15)'
          : 'rgba(255,255,255,.04)',
        color: active
          ? '#ffd700'
          : '#fff',
        cursor: 'pointer',
        fontSize: 11,
        fontWeight: 900,
      }}
    >
      {ORION_NAMES[race]}
    </button>
  );
}

function ListingRow({
  listing,
  onBuy,
}: {
  listing: Listing;
  onBuy: (
    listing: Listing
  ) => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'minmax(130px, 1.5fr) minmax(70px, .8fr) minmax(100px, 1fr) 80px',
        alignItems: 'center',
        gap: 10,
        padding:
          '12px 14px',
        borderRadius: 12,
        background:
          'rgba(255,255,255,.045)',
        border:
          '1px solid rgba(255,255,255,.07)',
      }}
    >
      <div>
        <div
          style={{
            fontWeight: 800,
          }}
        >
          {listing.itemName}
        </div>

        <div
          style={{
            marginTop: 3,
            color: '#8f9bb3',
            fontSize: 11,
          }}
        >
          Seller: {listing.seller}
        </div>
      </div>

      <div
        style={{
          color: '#d9e0ed',
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        {formatNumber(
          listing.quantity
        )}
      </div>

      <div
        style={{
          color: '#ffd700',
          fontWeight: 900,
          fontSize: 12,
        }}
      >
        {formatNumber(
          listing.price
        )}{' '}
        Token
      </div>

      <button
        type="button"
        onClick={() =>
          onBuy(listing)
        }
        style={{
          border: 'none',
          borderRadius: 8,
          padding:
            '8px 10px',
          background:
            '#ffd700',
          color: '#111',
          fontWeight: 900,
          cursor: 'pointer',
        }}
      >
        BUY
      </button>
    </div>
  );
}

function OrionListingRow({
  listing,
  onBuy,
}: {
  listing: OrionListing;
  onBuy: (
    listing: OrionListing
  ) => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'minmax(120px, 1.2fr) 70px 100px 100px 110px 80px',
        alignItems: 'center',
        gap: 8,
        padding:
          '12px 14px',
        borderRadius: 12,
        background:
          'rgba(255,255,255,.045)',
        border:
          '1px solid rgba(255,255,255,.07)',
      }}
    >
      <div>
        <div
          style={{
            fontWeight: 900,
          }}
        >
          {ORION_NAMES[
            listing.race
          ]}
        </div>

        <div
          style={{
            marginTop: 3,
            color: '#8f9bb3',
            fontSize: 11,
          }}
        >
          Seller: {listing.seller}
        </div>
      </div>

      <div
        style={{
          color: '#ffd700',
          fontWeight: 900,
          fontSize: 12,
        }}
      >
        Lv.{listing.level}
      </div>

      <div
        style={{
          fontSize: 11,
        }}
      >
        HP
        <div
          style={{
            color: '#86efac',
            fontWeight: 800,
          }}
        >
          {formatStat(
            listing.hp
          )}
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
        }}
      >
        ATK
        <div
          style={{
            color: '#fca5a5',
            fontWeight: 800,
          }}
        >
          {formatStat(
            listing.attack
          )}
        </div>
      </div>

      <div
        style={{
          color: '#ffd700',
          fontWeight: 900,
          fontSize: 12,
        }}
      >
        {formatNumber(
          listing.price
        )}{' '}
        Token
      </div>

      <button
        type="button"
        onClick={() =>
          onBuy(listing)
        }
        style={{
          border: 'none',
          borderRadius: 8,
          padding:
            '8px 10px',
          background:
            '#ffd700',
          color: '#111',
          fontWeight: 900,
          cursor: 'pointer',
        }}
      >
        BUY
      </button>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div
      style={{
        minHeight: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          'center',
        borderRadius: 14,
        border:
          '1px dashed rgba(255,255,255,.12)',
        color: '#7f8ca5',
        fontSize: 12,
        textAlign: 'center',
        padding: 20,
      }}
    >
      {text}
    </div>
  );
}

function SellModal({
  target,
  onClose,
  onConfirm,
}: {
  target: SellTarget;
  onClose: () => void;
  onConfirm: (
    quantity: number,
    pricePerItem: number
  ) => void;
}) {
  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    pricePerItem,
    setPricePerItem,
  ] = useState(1);

  const safeQuantity =
    target.type === 'orion'
      ? 1
      : Math.max(
          1,
          Math.min(
            target.available,
            Number.isFinite(
              quantity
            )
              ? quantity
              : 1
          )
        );

  const safePrice =
    Math.max(
      0,
      Number.isFinite(
        pricePerItem
      )
        ? pricePerItem
        : 0
    );

  const totalPrice =
    safeQuantity *
    safePrice;

  const tax =
    totalPrice *
    MUNICIPAL_TAX_RATE;

  const sellerAmount =
    totalPrice - tax;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70000,
        background:
          'rgba(0,0,0,.72)',
        display: 'flex',
        alignItems:
          'center',
        justifyContent:
          'center',
        padding: 20,
      }}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width:
            'min(500px, 94vw)',
          background:
            '#101520',
          color: '#fff',
          border:
            '1px solid rgba(255,215,0,.28)',
          borderRadius: 18,
          padding: 20,
          boxShadow:
            '0 20px 70px rgba(0,0,0,.65)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 1000,
              }}
            >
              SELL
            </div>

            <div
              style={{
                marginTop: 4,
                color:
                  '#8f9bb3',
                fontSize: 12,
              }}
            >
              {target.type ===
              'orion'
                ? `${ORION_NAMES[target.race]} Lv.${target.level}`
                : target.itemName}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              border: 'none',
              borderRadius: 8,
              background:
                'rgba(255,255,255,.08)',
              color: '#fff',
              cursor:
                'pointer',
              fontWeight: 900,
            }}
          >
            X
          </button>
        </div>

        {target.type ===
          'orion' && (
          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: 8,
            }}
          >
            <div
              style={{
                padding: 10,
                borderRadius: 10,
                background:
                  'rgba(255,255,255,.04)',
              }}
            >
              <div
                style={{
                  color:
                    '#8f9bb3',
                  fontSize: 10,
                }}
              >
                HP
              </div>

              <div
                style={{
                  marginTop: 4,
                  color:
                    '#86efac',
                  fontWeight:
                    900,
                }}
              >
                {formatStat(
                  target.hp
                )}
              </div>
            </div>

            <div
              style={{
                padding: 10,
                borderRadius: 10,
                background:
                  'rgba(255,255,255,.04)',
              }}
            >
              <div
                style={{
                  color:
                    '#8f9bb3',
                  fontSize: 10,
                }}
              >
                ATK
              </div>

              <div
                style={{
                  marginTop: 4,
                  color:
                    '#fca5a5',
                  fontWeight:
                    900,
                }}
              >
                {formatStat(
                  target.attack
                )}
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns:
              '1fr 1fr',
            gap: 12,
          }}
        >
          <label
            style={{
              display: 'grid',
              gap: 6,
              fontSize: 11,
              color:
                '#9aa6ba',
            }}
          >
            Quantity

            <input
              type="number"
              min={1}
              max={
                target.type ===
                'orion'
                  ? 1
                  : target.available
              }
              value={
                target.type ===
                'orion'
                  ? 1
                  : quantity
              }
              disabled={
                target.type ===
                'orion'
              }
              onChange={(event) =>
                setQuantity(
                  Number(
                    event.target
                      .value
                  )
                )
              }
              style={{
                width: '100%',
                boxSizing:
                  'border-box',
                height: 42,
                borderRadius: 10,
                border:
                  '1px solid rgba(255,255,255,.12)',
                background:
                  '#090d15',
                color: '#fff',
                padding:
                  '0 10px',
              }}
            />
          </label>

          <label
            style={{
              display: 'grid',
              gap: 6,
              fontSize: 11,
              color:
                '#9aa6ba',
            }}
          >
            Price Per Item

            <input
              type="number"
              min={0}
              step="0.01"
              value={
                pricePerItem
              }
              onChange={(event) =>
                setPricePerItem(
                  Number(
                    event.target
                      .value
                  )
                )
              }
              style={{
                width: '100%',
                boxSizing:
                  'border-box',
                height: 42,
                borderRadius: 10,
                border:
                  '1px solid rgba(255,255,255,.12)',
                background:
                  '#090d15',
                color: '#fff',
                padding:
                  '0 10px',
              }}
            />
          </label>
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gap: 8,
          }}
        >
          <SummaryRow
            label="Total Items"
            value={formatNumber(
              safeQuantity
            )}
          />

          <SummaryRow
            label="Price Per Item"
            value={`${formatNumber(
              safePrice
            )} Token`}
          />

          <SummaryRow
            label="Total Price"
            value={`${formatNumber(
              totalPrice
            )} Token`}
          />

          <SummaryRow
            label="Municipal Tax (5%)"
            value={`${formatNumber(
              tax
            )} Token`}
            accent="#fca5a5"
          />

          <SummaryRow
            label="You Receive"
            value={`${formatNumber(
              sellerAmount
            )} Token`}
            accent="#86efac"
            strong
          />
        </div>

        <div
          style={{
            marginTop: 10,
            color: '#687286',
            fontSize: 10,
            lineHeight: 1.5,
          }}
        >
          The municipal tax is
          deducted from the
          gross sale amount.
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1fr 1fr',
            gap: 10,
            marginTop: 18,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: 42,
              borderRadius: 10,
              border:
                '1px solid rgba(255,255,255,.12)',
              background:
                'rgba(255,255,255,.05)',
              color: '#fff',
              cursor:
                'pointer',
              fontWeight: 800,
            }}
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={() =>
              onConfirm(
                safeQuantity,
                safePrice
              )
            }
            disabled={
              safePrice <= 0
            }
            style={{
              height: 42,
              border: 'none',
              borderRadius: 10,
              background:
                safePrice > 0
                  ? '#ffd700'
                  : '#444',
              color:
                safePrice > 0
                  ? '#111'
                  : '#999',
              cursor:
                safePrice > 0
                  ? 'pointer'
                  : 'not-allowed',
              fontWeight: 1000,
            }}
          >
            SELL
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent,
  strong,
}: {
  label: string;
  value: string;
  accent?: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems:
          'center',
        justifyContent:
          'space-between',
        gap: 12,
        padding:
          '9px 11px',
        borderRadius: 9,
        background:
          'rgba(255,255,255,.035)',
      }}
    >
      <span
        style={{
          color:
            '#8f9bb3',
          fontSize: 11,
        }}
      >
        {label}
      </span>

      <span
        style={{
          color:
            accent ?? '#fff',
          fontSize: 12,
          fontWeight:
            strong
              ? 1000
              : 800,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function MarketplacePanel({
  open,
  onClose,
}: MarketplacePanelProps) {
  const [
    selection,
    setSelection,
  ] = useState<MarketSelection>({
    type: 'category',
    id: 'wood',
  });

  const [
    selectedOrionLevel,
    setSelectedOrionLevel,
  ] = useState(1);

  const [
    message,
    setMessage,
  ] = useState<
    string | null
  >(null);

  const [
    sellTarget,
    setSellTarget,
  ] = useState<
    SellTarget | null
  >(null);

  const [
    serverListings,
    setServerListings,
  ] = useState<Array<{
    id: number;
    sellerId: string;
    itemType: string;
    itemId: string;
    quantity: number;
    pricePerItem: number;
    currency: string;
  }>>([]);

  const [
    listingsLoading,
    setListingsLoading,
  ] = useState(false);

  const [
    sortKey,
    setSortKey,
  ] = useState<
    'most-expensive' |
    'cheapest' |
    'highest-level' |
    'lowest-level'
  >('most-expensive');

  const sortOptions: Array<{
    value: typeof sortKey;
    label: string;
  }> = [
    {
      value: 'most-expensive',
      label: 'Most Expensive',
    },
    {
      value: 'cheapest',
      label: 'Cheapest',
    },
    {
      value: 'highest-level',
      label: 'Highest Level',
    },
    {
      value: 'lowest-level',
      label: 'Lowest Level',
    },
  ];

  const reloadListings =
    useCallback(
      async () => {
        try {
          setListingsLoading(true);
          const rows =
            await getListings();
          setServerListings(
            rows.map((row) => ({
              id: row.id,
              sellerId:
                row.sellerId,
              itemType:
                row.itemType,
              itemId:
                row.itemId,
              quantity:
                row.quantity,
              pricePerItem:
                row.pricePerItem,
              currency:
                row.currency,
            }))
          );
        } catch {
          // Server offline – keep DEMO/empty state.
        } finally {
          setListingsLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    if (open) {
      void reloadListings();
    }
  }, [open, reloadListings]);

  const tokens =
    useResourceStore(
      (s) => s.resources.tokens
    );

  const resources =
    useResourceStore(
      (s) => s.resources
    );

  const spendTokens =
    useResourceStore(
      (s) => s.spendTokens
    );

  const spendWood =
    useResourceStore(
      (s) => s.spendWood
    );
  const spendStone =
    useResourceStore(
      (s) => s.spendStone
    );
  const spendIron =
    useResourceStore(
      (s) => s.spendIron
    );
  const spendGold =
    useResourceStore(
      (s) => s.spendGold
    );
  const spendCrystal =
    useResourceStore(
      (s) => s.spendCrystal
    );

  const spendElement =
    useResourceStore(
      (s) => s.spendElement
    );

  const addResource =
    useGameStore(
      (s) => s.addResource
    );

  const addToInventory =
    useGameStore(
      (s) => s.addToInventory
    );

  const removeFromInventory =
    useGameStore(
      (s) => s.removeFromInventory
    );

  const removeOrion =
    useOrionStore(
      (s) => s.removeOrion
    );
  const addOrion =
    useOrionStore(
      (s) => s.addOrion
    );

  const playerId =
    useGameStore(
      (s) =>
        s.playerProfile?.id ??
        s.gameState?.playerId ??
        'unknown-player'
    );

  const inventory =
    useGameStore(
      (s) =>
        s.gameState
          ?.inventory ?? []
    );

  const orions =
  useOrionStore(
    (s) => s.orions
  );
  const selectedCategory =
    selection.type ===
    'category'
      ? CATEGORIES.find(
          (item) =>
            item.id ===
            selection.id
        )
      : null;

  const currentResourceAmount =
    selection.type ===
      'category' &&
    selection.id !==
      'coming-soon' &&
    !selection.id.startsWith(
      'fruit-'
    )
      ? getResourceAmount(
          selection.id as ResourceCategory,
          resources
        )
      : null;

  const fruitInventory =
    selection.type ===
      'category' &&
    selection.id.startsWith(
      'fruit-'
    )
      ? getFruitInventory(
          selection.id as FruitCategory,
          inventory
        )
      : [];

  const itemListings =
    useMemo(
      () => {
        if (
          selection.type !==
          'category'
        ) {
          return [];
        }

        const demo =
          DEMO_LISTINGS[
            selection.id
          ] ?? [];

        const real: Listing[] =
          serverListings
            .filter(
              (row) => {
                const isFruit =
                  selection.id.startsWith(
                    'fruit-'
                  );
                const type =
                  isFruit
                    ? 'fruit'
                    : 'resource';
                return (
                  row.itemType ===
                    type &&
                  row.itemId ===
                    selection.id
                );
              }
            )
            .map((row) => ({
              id:
                `real-${row.id}`,
              listingId:
                row.id,
              sellerId:
                row.sellerId,
              seller:
                row.sellerId
                  .replace(
                    /^player-/,
                    ''
                  )
                  .slice(0, 8),
              itemName:
                getResourceDisplayName(
                  selection.id as ResourceCategory
                ),
              itemId:
                row.itemId,
              quantity:
                row.quantity,
              price:
                row.pricePerItem,
            }));

        return sortByPrice(
          [...demo, ...real],
          sortKey
        );
      },
      [
        selection,
        serverListings,
        sortKey,
      ]
    );

  const orionListings =
    useMemo(
      () => {
        if (
          selection.type !==
          'orion'
        ) {
          return [];
        }

        const demo =
          DEMO_ORION_LISTINGS[
            selection.race
          ].filter(
            (item) =>
              item.level ===
              selectedOrionLevel
          );

        const real: OrionListing[] =
          serverListings
            .filter(
              (row) =>
                row.itemType ===
                  'orion' &&
                row.itemId.startsWith(
                  `${selection.race}:`
                )
            )
            .map((row) => {
              const level =
                Number(
                  row.itemId.split(
                    ':'
                  )[1]
                ) || 1;
              const stat =
                getOrionStat(
                  selection.race,
                  level
                );
              return {
                id:
                  `real-${row.id}`,
                listingId:
                  row.id,
                sellerId:
                  row.sellerId,
                seller:
                  row.sellerId
                    .replace(
                      /^player-/,
                      ''
                    )
                    .slice(0, 8),
                race:
                  selection.race,
                level,
                attack: stat,
                hp: stat,
                price:
                  row.pricePerItem,
              };
            });

        return sortOrions(
          [...demo, ...real],
          sortKey,
          selectedOrionLevel
        );
      },
      [
        selection,
        serverListings,
        selectedOrionLevel,
        sortKey,
      ]
    );

  const selectedOrionCount =
    selection.type ===
    'orion'
      ? orions.filter(
          (orion) =>
            orion.race ===
              selection.race &&
            orion.level ===
              selectedOrionLevel
        ).length
      : 0;

  async function handleBuy(
    listing: Listing
  ) {
    const totalCost =
      Math.floor(
        listing.price *
          listing.quantity
      );

    if (
      tokens <
      totalCost
    ) {
      setMessage(
        `Not enough Orion Token. Need ${formatNumber(
          totalCost
        )} Token.`
      );
      return;
    }

    // Spend the tokens.
    if (
      listing.listingId !==
        undefined ||
      listing.sellerId ===
        playerId
    ) {
      // Real server listing: persist the sale transaction.
      try {
        await buyListing({
          buyerId: playerId,
          listingId: listing.listingId!,
          quantity: listing.quantity,
        });
      } catch (error) {
        setMessage(
          `Purchase failed. ${
            error instanceof Error
              ? error.message
              : 'Server offline?'
          }`
        );
        return;
      }
    }

    const spent =
      spendTokens(
        totalCost
      );

    if (!spent) {
      setMessage(
        'Purchase failed.'
      );
      return;
    }

    // Credit the bought item to the player.
    const item = listing.itemId;

    if (item.startsWith('fruit-')) {
      addToInventory({
        id: item,
        name: listing.itemName,
        type: 'fruit',
        quantity: listing.quantity,
      });
    } else {
      addResource(
        item,
        listing.quantity
      );
    }

    setMessage(
      `Purchased ${listing.quantity} ${listing.itemName} for ${formatNumber(
        totalCost
      )} Orion Token.`
    );

    void reloadListings();
  }

  async function handleOrionBuy(
    listing: OrionListing
  ) {
    if (
      tokens <
      listing.price
    ) {
      setMessage(
        `Not enough Orion Token. Need ${formatNumber(
          listing.price
        )} Token.`
      );
      return;
    }

    if (listing.listingId !== undefined) {
      try {
        await buyListing({
          buyerId: playerId,
          listingId: listing.listingId,
          quantity: 1,
        });
      } catch (error) {
        setMessage(
          `Purchase failed. ${
            error instanceof Error
              ? error.message
              : 'Server offline?'
          }`
        );
        return;
      }
    }

    const spent =
      spendTokens(
        listing.price
      );

    if (!spent) {
      setMessage(
        'Purchase failed.'
      );
      return;
    }

    addOrion(listing.race);

    setMessage(
      `Purchased ${ORION_NAMES[
        listing.race
      ]} Lv.${listing.level} for ${formatNumber(
        listing.price
      )} Orion Token.`
    );

    void reloadListings();
  }

  function handleSellOpenForItem(
    category: ResourceCategory
  ) {
    const available =
      getResourceAmount(
        category,
        resources
      );

    setSellTarget({
      type: 'item',
      itemId: category,
      itemName:
        getResourceDisplayName(
          category
        ),
      available,
    });

    setMessage(null);
  }

  function handleSellOpenForFruit(
    fruit: {
      id: string;
      name: string;
      quantity: number;
    }
  ) {
    setSellTarget({
      type: 'item',
      itemId: fruit.id,
      itemName:
        fruit.name,
      available:
        fruit.quantity,
    });

    setMessage(null);
  }

  function handleSellOpenForOrion() {
    if (
      selection.type !==
      'orion'
    ) {
      return;
    }

    if (
      selectedOrionCount <=
      0
    ) {
      setMessage(
        `You do not have a ${ORION_NAMES[
          selection.race
        ]} Orion at Level ${selectedOrionLevel}.`
      );
      return;
    }

    const stat =
      getOrionStat(
        selection.race,
        selectedOrionLevel
      );

    setSellTarget({
      type: 'orion',
      race:
        selection.race,
      level:
        selectedOrionLevel,
      available: 1,
      attack: stat,
      hp: stat,
    });

    setMessage(null);
  }

  async function handleSellConfirm(
    quantity: number,
    pricePerItem: number
  ) {
    if (!sellTarget) {
      return;
    }

    const target = sellTarget;
    const total =
      quantity *
      pricePerItem;

    const tax =
      total *
      MUNICIPAL_TAX_RATE;

    const receive =
      total - tax;

    // Determine the backend item type + id that represents this listing.
    let itemType: 'resource' | 'fruit' | 'orion' = 'resource';
    const isOrion =
      target.type === 'orion';
    const isFruit =
      target.type === 'item' &&
      target.itemId.startsWith('fruit-');
    const itemId =
      isOrion
        ? `${target.race}:${target.level}`
        : target.itemId;
    const race =
      isOrion ? target.race : null;
    const level =
      isOrion ? target.level : 0;

    if (isOrion) {
      itemType = 'orion';
    } else if (isFruit) {
      itemType = 'fruit';
    }

    setSellTarget(null);
    setMessage(null);

    // 1) Persist the listing on the server (real marketplace).
    try {
      await createListing({
        sellerId: playerId,
        itemType,
        itemId,
        quantity,
        pricePerItem,
        currency: 'orion-token',
      });
    } catch (error) {
      setMessage(
        `Listing failed to save. ${
          error instanceof Error
            ? error.message
            : 'Server offline?'
        }`
      );
      return;
    }

    // 2) Remove the sold items from the player's inventory now.
    if (itemType === 'orion') {
      const owned =
        race && level
          ? orions.find(
              (o) =>
                o.race === race &&
                o.level === level
            )
          : undefined;

      if (owned) {
        removeOrion(owned.id);
      }
    } else if (itemType === 'fruit') {
      removeFromInventory(
        itemId,
        quantity
      );
    } else if (itemType === 'resource') {
      const key = itemId as ResourceCategory;

      if (key === 'wood') spendWood(quantity);
      else if (key === 'stone') spendStone(quantity);
      else if (key === 'iron') spendIron(quantity);
      else if (key === 'gold') spendGold(quantity);
      else if (key === 'crystal') spendCrystal(quantity);
      else spendElement(key, quantity);
    }

    setMessage(
      `Listing created. ${formatNumber(
        receive
      )} Orion Token (after 5% tax) credited after sale.`
    );

    void reloadListings();
  }

  function closeMarketplace() {
    setSellTarget(null);
    setMessage(null);
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50000,
          width: '100vw',
          height: '100vh',
          background:
            '#080b12',
          backgroundImage:
            'linear-gradient(rgba(8,11,18,0.86), rgba(8,11,18,0.9)), url(/assets/orion_marketplace_bg.png)',
          backgroundSize:
            'cover',
          backgroundPosition:
            'center',
          overflow: 'hidden',
          color: '#fff',
        }}
      >
        {/* ==========================================================
            TOP BAR
        =========================================================== */}

        <div
          style={{
            height: 72,
            width: '100%',
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'space-between',
            padding:
              '0 20px',
            boxSizing:
              'border-box',
            background:
              '#0b0f18',
            borderBottom:
              '1px solid rgba(255,255,255,.1)',
          }}
        >
          <div
            style={{
              fontWeight: 1000,
              fontSize: 18,
              letterSpacing:
                '.06em',
              color:
                '#ffd700',
            }}
          >
            MARKETPLACE
          </div>

          <div
            style={{
              display:
                'flex',
              alignItems:
                'center',
              gap: 8,
              padding:
                '8px 14px',
              borderRadius: 999,
              background:
                'rgba(255,255,255,.05)',
              border:
                '1px solid rgba(255,255,255,.1)',
              fontWeight:
                900,
              color:
                '#9dd4ff',
              fontSize: 13,
            }}
          >
            Orion Token:
            {' '}
            {formatNumber(
              tokens
            )}
          </div>

          <button
            type="button"
            onClick={
              closeMarketplace
            }
            style={{
              width: 40,
              height: 40,
              border: 'none',
              borderRadius: 10,
              background:
                'rgba(255,255,255,.08)',
              color: '#fff',
              cursor:
                'pointer',
              fontSize: 17,
              fontWeight:
                900,
            }}
          >
            X
          </button>
        </div>

        {/* ==========================================================
            MAIN
        =========================================================== */}

        <div
          style={{
            display:
              'grid',
            gridTemplateColumns:
              'minmax(0, 3fr) minmax(230px, 1fr)',
            width: '100%',
            height:
              'calc(100vh - 72px)',
          }}
        >
          {/* ========================================================
              LEFT
          ========================================================= */}

          <div
            style={{
              minWidth: 0,
              padding: 20,
              boxSizing:
                'border-box',
              overflowY:
                'auto',
            }}
          >
            {/* MESSAGE */}

            {message && (
              <div
                style={{
                  marginBottom: 12,
                  padding:
                    '10px 12px',
                  borderRadius: 10,
                  background:
                    'rgba(34,197,94,.1)',
                  border:
                    '1px solid rgba(34,197,94,.25)',
                  color:
                    '#86efac',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {message}
              </div>
            )}

            {/* ======================================================
                ORION MARKET
            ======================================================= */}

            {selection.type ===
            'orion' ? (
              <>
                <div
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'space-between',
                    gap: 12,
                    flexWrap:
                      'wrap',
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize:
                          22,
                        fontWeight:
                          1000,
                      }}
                    >
                      {
                        ORION_NAMES[
                          selection.race
                        ]
                      } ORIONS
                    </div>

                    <div
                      style={{
                        marginTop:
                          4,
                        color:
                          '#8f9bb3',
                        fontSize:
                          12,
                      }}
                    >
                      Select one
                      of the 100
                      levels
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleSellOpenForOrion
                    }
                    disabled={
                      selectedOrionCount <=
                      0
                    }
                    style={{
                      border:
                        'none',
                      borderRadius:
                        10,
                      padding:
                        '10px 16px',
                      background:
                        selectedOrionCount >
                        0
                          ? '#ffd700'
                          : '#333',
                      color:
                        selectedOrionCount >
                        0
                          ? '#111'
                          : '#777',
                      cursor:
                        selectedOrionCount >
                        0
                          ? 'pointer'
                          : 'not-allowed',
                      fontWeight:
                        1000,
                    }}
                  >
                    SELL ORION
                  </button>
                </div>

                {/* LEVEL SELECTOR */}

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      'repeat(10, minmax(0, 1fr))',
                    gap: 6,
                    marginBottom:
                      18,
                  }}
                >
                  {Array.from(
                    {
                      length:
                        ORION_MAX_LEVEL,
                    },
                    (_, index) =>
                      index + 1
                  ).map(
                    (level) => {
                      const active =
                        level ===
                        selectedOrionLevel;

                      return (
                        <button
                          type="button"
                          key={
                            level
                          }
                          onClick={() =>
                            setSelectedOrionLevel(
                              level
                            )
                          }
                          style={{
                            minHeight:
                              32,
                            border:
                              active
                                ? '1px solid rgba(255,215,0,.95)'
                                : '1px solid rgba(255,255,255,.1)',
                            borderRadius:
                              7,
                            background:
                              active
                                ? 'rgba(255,215,0,.16)'
                                : 'rgba(255,255,255,.04)',
                            color:
                              active
                                ? '#ffd700'
                                : '#fff',
                            cursor:
                              'pointer',
                            fontSize:
                              10,
                            fontWeight:
                              900,
                          }}
                        >
                          {level}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* LEVEL INFO */}

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      'repeat(3, minmax(0, 1fr))',
                    gap: 10,
                    marginBottom:
                      14,
                  }}
                >
                  <SummaryRow
                    label="LEVEL"
                    value={`Lv.${selectedOrionLevel}`}
                  />

                  <SummaryRow
                    label="HP"
                    value={formatStat(
                      getOrionStat(
                        selection.race,
                        selectedOrionLevel
                      )
                    )}
                    accent="#86efac"
                  />

                  <SummaryRow
                    label="ATK"
                    value={formatStat(
                      getOrionStat(
                        selection.race,
                        selectedOrionLevel
                      )
                    )}
                    accent="#fca5a5"
                  />
                </div>

                <div
                  style={{
                    padding:
                      '8px 14px',
                    color:
                      '#7f8ca5',
                    fontSize:
                      10,
                    fontWeight:
                      900,
                    letterSpacing:
                      '.08em',
                  }}
                >
                  SELLER / LEVEL / HP / ATK / PRICE
                </div>

                {orionListings.length ===
                0 ? (
                  <EmptyState
                    text={`No ${ORION_NAMES[
                      selection.race
                    ]} Level ${selectedOrionLevel} listings yet.`}
                  />
                ) : (
                  <div
                    style={{
                      display:
                        'grid',
                      gap: 8,
                    }}
                  >
                    {orionListings.map(
                      (listing) => (
                        <OrionListingRow
                          key={
                            listing.id
                          }
                          listing={
                            listing
                          }
                          onBuy={
                            handleOrionBuy
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* ==================================================
                    ITEM CATEGORY
                =================================================== */}

                <div
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'space-between',
                    gap: 12,
                    flexWrap:
                      'wrap',
                    marginBottom:
                      14,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize:
                          22,
                        fontWeight:
                          1000,
                      }}
                    >
                      {
                        selectedCategory?.label
                      }
                    </div>

                    <div
                      style={{
                        marginTop:
                          4,
                        color:
                          '#8f9bb3',
                        fontSize:
                          12,
                      }}
                    >
                      Marketplace
                      listings
                    </div>
                  </div>

                  {currentResourceAmount !==
                    null && (
                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          padding:
                            '9px 14px',
                          borderRadius:
                            10,
                          background:
                            'rgba(255,255,255,.06)',
                          border:
                            '1px solid rgba(255,255,255,.08)',
                          fontWeight:
                            900,
                        }}
                      >
                        Your{' '}
                        {
                          selectedCategory?.label
                        }:{' '}
                        {formatNumber(
                          currentResourceAmount
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleSellOpenForItem(
                            selection.id as ResourceCategory
                          )
                        }
                        disabled={
                          currentResourceAmount <=
                          0
                        }
                        style={{
                          border:
                            'none',
                          borderRadius:
                            10,
                          padding:
                            '10px 16px',
                          background:
                            currentResourceAmount >
                            0
                              ? '#ffd700'
                              : '#333',
                          color:
                            currentResourceAmount >
                            0
                              ? '#111'
                              : '#777',
                          cursor:
                            currentResourceAmount >
                            0
                              ? 'pointer'
                              : 'not-allowed',
                          fontWeight:
                            1000,
                        }}
                      >
                        SELL
                      </button>
                    </div>
                  )}

                  {selection.id.startsWith(
                    'fruit-'
                  ) && (
                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          padding:
                            '9px 14px',
                          borderRadius:
                            10,
                          background:
                            'rgba(255,255,255,.06)',
                          border:
                            '1px solid rgba(255,255,255,.08)',
                          fontWeight:
                            900,
                        }}
                      >
                        Your Fruits:{' '}
                        {fruitInventory.reduce(
                          (
                            total,
                            item
                          ) =>
                            total +
                            item.quantity,
                          0
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* LOCKED */}

                {selectedCategory?.locked && (
                  <EmptyState
                    text="COMING SOON"
                  />
                )}

                {/* FRUITS */}

                {!selectedCategory?.locked &&
                  selection.id.startsWith(
                    'fruit-'
                  ) && (
                    <div
                      style={{
                        display:
                          'grid',
                        gap: 8,
                      }}
                    >
                      {fruitInventory.length ===
                      0 ? (
                        <EmptyState
                          text="No fruits in your inventory yet."
                        />
                      ) : (
                        fruitInventory.map(
                          (fruit) => (
                            <div
                              key={
                                fruit.id
                              }
                              style={{
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'space-between',
                                gap: 12,
                                padding:
                                  '14px 16px',
                                borderRadius:
                                  12,
                                background:
                                  'rgba(255,255,255,.045)',
                                border:
                                  '1px solid rgba(255,255,255,.07)',
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontWeight:
                                      900,
                                  }}
                                >
                                  {
                                    fruit.name
                                  }
                                </div>

                                <div
                                  style={{
                                    marginTop:
                                      4,
                                    color:
                                      '#9ca8bc',
                                    fontSize:
                                      11,
                                  }}
                                >
                                  Quantity:{' '}
                                  {formatNumber(
                                    fruit.quantity
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleSellOpenForFruit(
                                    fruit
                                  )
                                }
                                style={{
                                  border:
                                    'none',
                                  borderRadius:
                                    8,
                                  padding:
                                    '8px 12px',
                                  background:
                                    '#ffd700',
                                  color:
                                    '#111',
                                  cursor:
                                    'pointer',
                                  fontWeight:
                                    900,
                                }}
                              >
                                SELL
                              </button>
                            </div>
                          )
                        )
                      )}
                    </div>
                  )}

{/* SORT BAR */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      color: '#7f8ca5',
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: '.05em',
                    }}
                  >
                    {listingsLoading
                      ? 'Syncing...'
                      : 'Sort by'}
                  </div>

                  <select
                    value={sortKey}
                    onChange={(e) =>
                      setSortKey(
                        e.target
                          .value as typeof sortKey
                      )
                    }
                    style={{
                      background: '#161b29',
                      color: '#fff',
                      border:
                        '1px solid #2c3654',
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {sortOptions.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* NORMAL LISTINGS */}
                {/* NORMAL LISTINGS */}

                {!selectedCategory?.locked &&
                  !selection.id.startsWith(
                    'fruit-'
                  ) && (
                    <>
                      <div
                        style={{
                          display:
                            'grid',
                          gridTemplateColumns:
                            'minmax(130px, 1.5fr) minmax(70px, .8fr) minmax(100px, 1fr) 80px',
                          gap: 10,
                          padding:
                            '8px 14px',
                          color:
                            '#7f8ca5',
                          fontSize:
                            10,
                          fontWeight:
                            900,
                          letterSpacing:
                            '.08em',
                        }}
                      >
                        <div>
                          ITEM / SELLER
                        </div>

                        <div>
                          QUANTITY
                        </div>

                        <div>
                          PRICE
                        </div>

                        <div />
                      </div>

                      {itemListings.length ===
                      0 ? (
                        <EmptyState
                          text={`No ${
                           selectedCategory?.label ?? ''
                          } listings yet.`}
                        />
                      ) : (
                        <div
                          style={{
                            display:
                              'grid',
                            gap: 8,
                          }}
                        >
                          {itemListings.map(
                            (
                              listing
                            ) => (
                              <ListingRow
                                key={
                                  listing.id
                                }
                                listing={
                                  listing
                                }
                                onBuy={
                                  handleBuy
                                }
                              />
                            )
                          )}
                        </div>
                      )}
                    </>
                  )}
              </>
            )}
          </div>

          {/* ==========================================================
              RIGHT 25%
          =========================================================== */}

          <div
            style={{
              minWidth: 0,
              padding:
                '18px 14px',
              boxSizing:
                'border-box',
              borderLeft:
                '1px solid rgba(255,255,255,.08)',
              background:
                '#0b0f18',
              overflowY:
                'auto',
            }}
          >
            {/* ORION MARKET */}

            <div
              style={{
                color:
                  '#ffd700',
                fontSize: 10,
                fontWeight: 1000,
                letterSpacing:
                  '.1em',
                marginBottom: 8,
              }}
            >
              ORION MARKET
            </div>

            <div
              style={{
                display:
                  'flex',
                flexWrap:
                  'wrap',
                gap: 7,
                marginBottom:
                  16,
              }}
            >
              {ORION_RACES.map(
                (race) => (
                  <OrionRaceButton
                    key={race}
                    race={race}
                    active={
                      selection.type ===
                        'orion' &&
                      selection.race ===
                        race
                    }
                    onClick={() => {
                      setSelection({
                        type:
                          'orion',
                        race,
                      });
                      setMessage(
                        null
                      );
                      setSelectedOrionLevel(
                        1
                      );
                    }}
                  />
                )
              )}
            </div>

            <div
              style={{
                height: 1,
                background:
                  'rgba(255,255,255,.08)',
                marginBottom:
                  14,
              }}
            />

            <div
              style={{
                marginBottom:
                  12,
                color:
                  '#8f9bb3',
                fontSize: 10,
                fontWeight: 900,
                letterSpacing:
                  '.1em',
              }}
            >
              ITEMS
            </div>

            <div
              style={{
                display:
                  'flex',
                flexDirection:
                  'column',
                gap: 8,
              }}
            >
              {CATEGORIES.map(
                (category) => (
                  <CategoryButton
                    key={
                      category.id
                    }
                    category={
                      category
                    }
                    active={
                      selection.type ===
                        'category' &&
                      selection.id ===
                        category.id
                    }
                    onClick={() => {
                      setSelection({
                        type:
                          'category',
                        id:
                          category.id,
                      });
                      setMessage(
                        null
                      );
                    }}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SELL MODAL
      ============================================================ */}

      {sellTarget && (
        <SellModal
          target={
            sellTarget
          }
          onClose={() =>
            setSellTarget(
              null
            )
          }
          onConfirm={
            handleSellConfirm
          }
        />
      )}
    </>
  );
}

