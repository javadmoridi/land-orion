import type { CSSProperties } from 'react';
import { useState } from 'react';
import {
  QUEST_CHARACTERS,
  getDailyQuestsForCharacter,
  type QuestCharacterId,
  type Quest,
} from '../economy/quests';
import { useResourceStore } from '../economy/resourceStore';
import { useGameStore } from './useGameStore';

interface QuestPanelProps {
  open: boolean;
  onClose: () => void;
}

const characterImages: Record<QuestCharacterId, string> = {
  lyra: '/assets/princess.png',
  kael: '/assets/prince.png',
  nyx: '/assets/wise-elder.png',
  aeris: '/assets/grandmother.png',
  orion: '/assets/grand-chief.png',
};

const resourceImages: Record<string, string> = {
  water: '/assets/orion-water.png',
  air: '/assets/orion-air.png',
  earth: '/assets/orion-earth.png',
  fire: '/assets/orion-fire.png',
  wood: '/assets/orion-wood.png',
  stone: '/assets/orion-stone.png',
  iron: '/assets/orion-iron.png',
  gold: '/assets/orion-gold.png',
  crystal: '/assets/orion-crystal.png',
  food: '/assets/food.png',
};

const coinImage = '/assets/currency_coin.png';

function getQuestRequirement(quest: Quest): {
  resource: string;
  amount: number;
} | null {
  const labels = quest.condition.label.toLowerCase();

  const match = labels.match(
    /(?:have|collect|reach)\s+([\d,]+)\s+([a-z]+)/
  );

  if (!match) {
    if (labels.includes('wood')) {
      const number = labels.match(/(\d[\d,]*)/);
      return {
        resource: 'wood',
        amount: number
          ? Number(number[1].replace(/,/g, ''))
          : 1,
      };
    }

    if (labels.includes('stone')) {
      const number = labels.match(/(\d[\d,]*)/);
      return {
        resource: 'stone',
        amount: number
          ? Number(number[1].replace(/,/g, ''))
          : 1,
      };
    }

    if (labels.includes('water')) {
      const number = labels.match(/(\d[\d,]*)/);
      return {
        resource: 'water',
        amount: number
          ? Number(number[1].replace(/,/g, ''))
          : 1,
      };
    }

    if (labels.includes('air')) {
      const number = labels.match(/(\d[\d,]*)/);
      return {
        resource: 'air',
        amount: number
          ? Number(number[1].replace(/,/g, ''))
          : 1,
      };
    }

    if (labels.includes('fire')) {
      const number = labels.match(/(\d[\d,]*)/);
      return {
        resource: 'fire',
        amount: number
          ? Number(number[1].replace(/,/g, ''))
          : 1,
      };
    }

    if (labels.includes('earth')) {
      const number = labels.match(/(\d[\d,]*)/);
      return {
        resource: 'earth',
        amount: number
          ? Number(number[1].replace(/,/g, ''))
          : 1,
      };
    }

    if (labels.includes('iron')) {
      const number = labels.match(/(\d[\d,]*)/);
      return {
        resource: 'iron',
        amount: number
          ? Number(number[1].replace(/,/g, ''))
          : 1,
      };
    }

    if (labels.includes('gold')) {
      const number = labels.match(/(\d[\d,]*)/);
      return {
        resource: 'gold',
        amount: number
          ? Number(number[1].replace(/,/g, ''))
          : 1,
      };
    }

    if (labels.includes('crystal')) {
      const number = labels.match(/(\d[\d,]*)/);
      return {
        resource: 'crystal',
        amount: number
          ? Number(number[1].replace(/,/g, ''))
          : 1,
      };
    }

    if (labels.includes('food')) {
      const number = labels.match(/(\d[\d,]*)/);
      return {
        resource: 'food',
        amount: number
          ? Number(number[1].replace(/,/g, ''))
          : 1,
      };
    }

    return null;
  }

  return {
    resource: match[2],
    amount: Number(match[1].replace(/,/g, '')),
  };
}

function getRewardItems(quest: Quest) {
  const rewards = Object.entries(quest.reward).filter(
    ([key, value]) =>
      key !== 'coins' &&
      key !== 'tokens' &&
      key !== 'gems' &&
      typeof value === 'number' &&
      value > 0
  );

  return rewards;
}

export function QuestPanel({
  open,
  onClose,
}: QuestPanelProps) {
  const {
    claimQuest,
    canClaimQuest,
    claimedQuestIds,
  } = useResourceStore();

  useGameStore((s) => s.gameState);

  const [selectedCharacter, setSelectedCharacter] =
    useState<QuestCharacterId>('lyra');

  if (!open) return null;

  const selected =
    QUEST_CHARACTERS.find(
      (character) =>
        character.id === selectedCharacter
    ) ?? QUEST_CHARACTERS[0];

  const dailyQuests =
    getDailyQuestsForCharacter(
      selectedCharacter,
      new Date()
    );

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(2, 5, 14, 0.86)',
    backdropFilter: 'blur(8px)',
    padding: '1rem',
  };

  const panelStyle: CSSProperties = {
    width: 'min(1000px, 100%)',
    height: 'min(720px, 90vh)',
    display: 'flex',
    flexDirection: 'column',
    background:
      'linear-gradient(145deg, rgba(17,24,43,0.99), rgba(7,11,23,0.99))',
    border: '1px solid rgba(120,150,255,0.2)',
    borderRadius: 24,
    boxShadow:
      '0 30px 100px rgba(0,0,0,0.7), 0 0 60px rgba(80,100,255,0.08)',
    overflow: 'hidden',
  };

  return (
    <div
      style={overlayStyle}
      onClick={onClose}
    >
      <div
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR */}
        <div
          style={{
            height: 78,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.25rem',
            borderBottom:
              '1px solid rgba(255,255,255,0.07)',
            background:
              'rgba(255,255,255,0.018)',
          }}
        >
          <div>
            <div
              style={{
                color: '#7183a8',
                fontSize: '0.63rem',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
              }}
            >
              Orion
            </div>

            <div
              style={{
                color: '#f5f7ff',
                fontSize: '1.35rem',
                fontWeight: 850,
                marginTop: 3,
              }}
            >
              Daily Quests
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              border:
                '1px solid rgba(255,255,255,0.1)',
              background:
                'rgba(255,255,255,0.055)',
              color: '#b9c5df',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* MAIN */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns:
              '220px minmax(0, 1fr)',
          }}
        >
          {/* CHARACTERS */}
          <div
            style={{
              minHeight: 0,
              overflowY: 'auto',
              padding: '0.9rem',
              borderRight:
                '1px solid rgba(255,255,255,0.07)',
              background:
                'rgba(0,0,0,0.12)',
            }}
          >
            <div
              style={{
                color: '#7183a8',
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.7rem',
              }}
            >
              Quest Characters
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
              }}
            >
              {QUEST_CHARACTERS.map(
                (character) => {
                  const active =
                    selectedCharacter ===
                    character.id;

                  return (
                    <button
                      key={character.id}
                      onClick={() =>
                        setSelectedCharacter(
                          character.id
                        )
                      }
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.7rem',
                        padding: '0.6rem',
                        borderRadius: 15,
                        border: active
                          ? '1px solid rgba(255,210,80,0.42)'
                          : '1px solid rgba(255,255,255,0.06)',
                        background: active
                          ? 'linear-gradient(135deg, rgba(255,205,70,0.14), rgba(255,255,255,0.025))'
                          : 'rgba(255,255,255,0.025)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          width: 53,
                          height: 53,
                          flexShrink: 0,
                          borderRadius: 13,
                          overflow: 'hidden',
                          border: active
                            ? '1px solid rgba(255,210,80,0.45)'
                            : '1px solid rgba(255,255,255,0.1)',
                          background:
                            'rgba(255,255,255,0.06)',
                        }}
                      >
                        <img
                          src={
                            characterImages[
                              character.id
                            ]
                          }
                          alt={character.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            color: active
                              ? '#fff1b0'
                              : '#e9edfa',
                            fontSize:
                              '0.82rem',
                            fontWeight: 800,
                          }}
                        >
                          {character.name}
                        </div>

                        <div
                          style={{
                            color: '#7889aa',
                            fontSize:
                              '0.62rem',
                            marginTop: 3,
                            whiteSpace:
                              'nowrap',
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                          }}
                        >
                          {character.title}
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* QUEST DETAILS */}
          <div
            style={{
              minWidth: 0,
              minHeight: 0,
              overflowY: 'auto',
              padding: '1rem',
            }}
          >
            {/* SELECTED CHARACTER */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
                padding: '0.85rem',
                borderRadius: 17,
                background:
                  'linear-gradient(135deg, rgba(90,115,190,0.12), rgba(255,255,255,0.025))',
                border:
                  '1px solid rgba(120,150,255,0.13)',
                marginBottom: '0.9rem',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  flexShrink: 0,
                  borderRadius: 17,
                  overflow: 'hidden',
                  border:
                    '1px solid rgba(255,255,255,0.12)',
                  boxShadow:
                    '0 10px 28px rgba(0,0,0,0.35)',
                }}
              >
                <img
                  src={
                    characterImages[
                      selected.id
                    ]
                  }
                  alt={selected.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    color: '#f6f8ff',
                    fontSize: '1.1rem',
                    fontWeight: 850,
                  }}
                >
                  {selected.name}
                </div>

                <div
                  style={{
                    color: '#8293b5',
                    fontSize: '0.72rem',
                    marginTop: 3,
                  }}
                >
                  {selected.title}
                </div>

                <div
                  style={{
                    color: '#637494',
                    fontSize: '0.65rem',
                    marginTop: 7,
                  }}
                >
                  Today's 2 quests
                </div>
              </div>
            </div>

            {/* QUESTS */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
              }}
            >
              {dailyQuests.map((quest) => {
                const claimed =
                  claimedQuestIds.includes(
                    quest.id
                  );

                const claimable =
                  canClaimQuest(quest.id);

                const requirement =
                  getQuestRequirement(quest);

                const rewardItems =
                  getRewardItems(quest);

                return (
                  <div
                    key={quest.id}
                    style={{
                      borderRadius: 18,
                      padding: '1rem',
                      background:
                        claimed
                          ? 'linear-gradient(135deg, rgba(35,120,75,0.12), rgba(255,255,255,0.025))'
                          : 'rgba(255,255,255,0.035)',
                      border: `1px solid ${
                        claimed
                          ? 'rgba(70,210,120,0.28)'
                          : claimable
                            ? 'rgba(255,205,70,0.28)'
                            : 'rgba(255,255,255,0.07)'
                      }`,
                    }}
                  >
                    {/* QUEST TITLE */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems:
                          'center',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          width: 45,
                          height: 45,
                          flexShrink: 0,
                          borderRadius: 12,
                          overflow: 'hidden',
                          border:
                            '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <img
                          src={
                            characterImages[
                              selected.id
                            ]
                          }
                          alt={
                            selected.name
                          }
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit:
                              'cover',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            color: '#f4f6ff',
                            fontSize:
                              '0.95rem',
                            fontWeight: 800,
                          }}
                        >
                          {quest.title}
                        </div>

                        <div
                          style={{
                            color: '#8494b3',
                            fontSize:
                              '0.7rem',
                            marginTop: 3,
                          }}
                        >
                          {quest.description}
                        </div>
                      </div>

                      {claimed && (
                        <div
                          style={{
                            color: '#62d894',
                            fontSize:
                              '0.62rem',
                            fontWeight: 800,
                          }}
                        >
                          CLAIMED
                        </div>
                      )}
                    </div>

                    {/* ITEM + REWARD */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          '1fr 1fr',
                        gap: '0.65rem',
                        marginTop:
                          '0.85rem',
                      }}
                    >
                      {/* REQUIRED ITEM */}
                      <div
                        style={{
                          padding:
                            '0.75rem',
                          borderRadius: 13,
                          background:
                            'rgba(100,130,200,0.055)',
                          border:
                            '1px solid rgba(100,130,200,0.1)',
                        }}
                      >
                        <div
                          style={{
                            color:
                              '#7183a8',
                            fontSize:
                              '0.6rem',
                            textTransform:
                              'uppercase',
                            letterSpacing:
                              '0.08em',
                            marginBottom:
                              '0.5rem',
                          }}
                        >
                          Send Item
                        </div>

                        {requirement ? (
                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: '0.6rem',
                            }}
                          >
                            <img
                              src={
                                resourceImages[
                                  requirement.resource
                                ] ??
                                '/assets/orion-crystal.png'
                              }
                              alt={
                                requirement.resource
                              }
                              style={{
                                width: 42,
                                height: 42,
                                objectFit:
                                  'contain',
                              }}
                            />

                            <div>
                              <div
                                style={{
                                  color:
                                    '#f3f6ff',
                                  fontSize:
                                    '0.85rem',
                                  fontWeight:
                                    800,
                                  textTransform:
                                    'capitalize',
                                }}
                              >
                                {
                                  requirement.resource
                                }
                              </div>

                              <div
                                style={{
                                  color:
                                    '#aab9d6',
                                  fontSize:
                                    '0.72rem',
                                  marginTop:
                                    2,
                                }}
                              >
                                ×
                                {requirement.amount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              color:
                                '#aab9d6',
                              fontSize:
                                '0.75rem',
                            }}
                          >
                            Complete the
                            requirement
                          </div>
                        )}
                      </div>

                      {/* REWARD */}
                      <div
                        style={{
                          padding:
                            '0.75rem',
                          borderRadius: 13,
                          background:
                            'rgba(255,200,50,0.055)',
                          border:
                            '1px solid rgba(255,205,70,0.12)',
                        }}
                      >
                        <div
                          style={{
                            color:
                              '#a38a48',
                            fontSize:
                              '0.6rem',
                            textTransform:
                              'uppercase',
                            letterSpacing:
                              '0.08em',
                            marginBottom:
                              '0.5rem',
                          }}
                        >
                          Reward
                        </div>

                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap: '0.6rem',
                          }}
                        >
                          <img
                            src={
                              coinImage
                            }
                            alt="Coins"
                            style={{
                              width: 42,
                              height: 42,
                              objectFit:
                                'contain',
                            }}
                          />

                          <div>
                            <div
                              style={{
                                color:
                                  '#fff1a8',
                                fontSize:
                                  '0.85rem',
                                fontWeight:
                                  850,
                              }}
                            >
                              +
                              {quest.reward.coins.toLocaleString()}
                            </div>

                            <div
                              style={{
                                color:
                                  '#a38f59',
                                fontSize:
                                  '0.68rem',
                                marginTop:
                                  2,
                              }}
                            >
                              Coins
                            </div>
                          </div>
                        </div>

                        {rewardItems.length >
                          0 && (
                          <div
                            style={{
                              display:
                                'flex',
                              gap:
                                '0.35rem',
                              marginTop:
                                '0.55rem',
                              flexWrap:
                                'wrap',
                            }}
                          >
                            {rewardItems.map(
                              ([
                                resource,
                                amount,
                              ]) => (
                                <div
                                  key={
                                    resource
                                  }
                                  style={{
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    gap:
                                      '0.25rem',
                                    padding:
                                      '0.25rem 0.4rem',
                                    borderRadius:
                                      7,
                                    background:
                                      'rgba(255,255,255,0.04)',
                                  }}
                                >
                                  <img
                                    src={
                                      resourceImages[
                                        resource
                                      ] ??
                                      '/assets/orion-crystal.png'
                                    }
                                    alt={
                                      resource
                                    }
                                    style={{
                                      width: 20,
                                      height: 20,
                                      objectFit:
                                        'contain',
                                    }}
                                  />

                                  <span
                                    style={{
                                      color:
                                        '#b8c5df',
                                      fontSize:
                                        '0.62rem',
                                    }}
                                  >
                                    +
                                    {Number(
                                      amount
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CLAIM BUTTON */}
                    <button
                      disabled={
                        claimed ||
                        !claimable
                      }
                      onClick={() =>
                        claimQuest(
                          quest.id
                        )
                      }
                      style={{
                        width: '100%',
                        marginTop:
                          '0.8rem',
                        padding:
                          '0.78rem',
                        border: 'none',
                        borderRadius: 12,
                        fontSize:
                          '0.8rem',
                        fontWeight: 850,
                        cursor:
                          claimed ||
                          !claimable
                            ? 'not-allowed'
                            : 'pointer',
                        background:
                          claimed
                            ? 'rgba(50,190,105,0.12)'
                            : claimable
                              ? 'linear-gradient(135deg, #ffd95a, #f4b936)'
                              : 'rgba(255,255,255,0.06)',
                        color:
                          claimed
                            ? '#62d894'
                            : claimable
                              ? '#111827'
                              : '#697895',
                        boxShadow:
                          claimable
                            ? '0 7px 22px rgba(255,190,50,0.16)'
                            : 'none',
                      }}
                    >
                      {claimed
                        ? 'پاداش دریافت شد'
                        : 'دریافت پاداش'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}