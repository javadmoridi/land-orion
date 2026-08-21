import { useEffect, useMemo, useState } from 'react';

import {
  FOOD_CATALOG,
  type FoodDefinition,
} from '../economy/foodCatalog';

import { useFoodCookingStore } from '../economy/foodCookingStore';
import { useResourceStore } from '../economy/resourceStore';
import { useGameStore } from './useGameStore';

function formatTime(seconds: number): string {
  const safe = Math.max(0, seconds);

  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;

  return `${minutes}:${secs
    .toString()
    .padStart(2, '0')}`;
}

export default function Kitchen() {
  const gameState = useGameStore(
    (state) => state.gameState,
  );

  const inventory =
    gameState?.inventory ?? [];

  const resources =
    useResourceStore(
      (state) => state.resources,
    );

  const jobs = useFoodCookingStore(
    (state) => state.jobs,
  );

  const cookFood = useFoodCookingStore(
    (state) => state.cookFood,
  );

  const quickCook = useFoodCookingStore(
    (state) => state.quickCook,
  );

  const collectFinishedFood =
    useFoodCookingStore(
      (state) => state.collectFinishedFood,
    );

  const getRemainingSeconds =
    useFoodCookingStore(
      (state) => state.getRemainingSeconds,
    );

  const getQuickCookCost =
    useFoodCookingStore(
      (state) => state.getQuickCookCost,
    );

  const [selectedFoodId, setSelectedFoodId] =
    useState<string | null>(null);

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      forceUpdate((value) => value + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const selectedFood = useMemo(
    () =>
      FOOD_CATALOG.find(
        (food) => food.id === selectedFoodId,
      ) ?? null,
    [selectedFoodId],
  );

  function getAvailableAmount(
    food: FoodDefinition,
    ingredientId: string,
    type: 'inventory' | 'resource',
  ): number {
    if (type === 'inventory') {
      const item = inventory.find(
        (entry) => entry.id === ingredientId,
      );

      return item?.quantity ?? 0;
    }

    return (
      resources[
        ingredientId as keyof typeof resources
      ] ?? 0
    );
  }

  function canCook(
    food: FoodDefinition,
  ): boolean {
    return food.ingredients.every(
      (ingredient) => {
        const available =
          getAvailableAmount(
            food,
            ingredient.id,
            ingredient.type,
          );

        return (
          available >=
          ingredient.quantity
        );
      },
    );
  }

  function handleCook() {
    if (!selectedFood) {
      return;
    }

    const success =
      cookFood(selectedFood);

    if (!success) {
      window.alert(
        'مواد اولیه کافی نیست.',
      );

      return;
    }

    setSelectedFoodId(null);
  }

  function handleQuickCook(
    jobId: string,
  ) {
    const job =
      jobs.find(
        (item) => item.id === jobId,
      );

    if (!job) {
      return;
    }

    const remaining =
      getRemainingSeconds(jobId);

    if (remaining <= 0) {
      collectFinishedFood(jobId);
      return;
    }

    const minutes =
      Math.ceil(remaining / 60);

    const gemCost =
      getQuickCookCost(minutes);

    const confirmed =
      window.confirm(
        `تکمیل فوری این غذا ${gemCost} جم هزینه دارد. ادامه می‌دهید؟`,
      );

    if (!confirmed) {
      return;
    }

    const success =
      quickCook(jobId);

    if (!success) {
      window.alert(
        'جم کافی نیست.',
      );
    }
  }

  function handleCollect(
    jobId: string,
  ) {
    const success =
      collectFinishedFood(jobId);

    if (!success) {
      window.alert(
        'پخت هنوز تمام نشده است.',
      );
    }
  }

  return (
    <div
      style={{
        minHeight: '100%',
        width: '100%',
        boxSizing: 'border-box',
        padding: 24,
        color: '#fff',
        background:
          'linear-gradient(135deg, #241331 0%, #321947 45%, #1b1028 100%)',
        fontFamily:
          'Arial, sans-serif',
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 22,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            آشپزخانه
          </h2>

          <div
            style={{
              marginTop: 6,
              color: '#d9c6e8',
              fontSize: 13,
            }}
          >
            غذاهای مورد علاقه‌ات را انتخاب و آماده کن
          </div>
        </div>
      </div>

      {/* COOKING QUEUE */}

      {jobs.length > 0 && (
        <section
          style={{
            marginBottom: 24,
            padding: 18,
            borderRadius: 24,
            background:
              'rgba(72, 38, 92, 0.88)',
            border:
              '1px solid rgba(255,255,255,0.12)',
            boxShadow:
              '0 12px 35px rgba(0,0,0,0.25)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <h3
              style={{
                margin: 0,
                color: '#fff',
                fontSize: 18,
              }}
            >
              در حال پخت
            </h3>

            <span
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                background:
                  'rgba(255,255,255,0.1)',
                color: '#e9d9f5',
                fontSize: 12,
              }}
            >
              {jobs.length} غذا
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {jobs.map((job) => {
              const food =
                FOOD_CATALOG.find(
                  (item) =>
                    item.id === job.foodId,
                );

              if (!food) {
                return null;
              }

              const remaining =
                getRemainingSeconds(
                  job.id,
                );

              const finished =
                remaining <= 0 ||
                job.completed;

              return (
                <div
                  key={job.id}
                  style={{
                    minWidth: 250,
                    padding: 14,
                    borderRadius: 20,
                    background:
                      'rgba(36, 19, 49, 0.85)',
                    border:
                      '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      style={{
                        width: 58,
                        height: 58,
                        objectFit: 'contain',
                        borderRadius: 16,
                        background:
                          '#4a2760',
                        padding: 6,
                        boxSizing:
                          'border-box',
                      }}
                    />

                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {food.name}
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          color:
                            finished
                              ? '#f3d7ff'
                              : '#cdb6db',
                          fontSize: 13,
                        }}
                      >
                        {finished
                          ? 'آماده دریافت'
                          : formatTime(
                              remaining,
                            )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      finished
                        ? handleCollect(
                            job.id,
                          )
                        : handleQuickCook(
                            job.id,
                          )
                    }
                    style={{
                      width: '100%',
                      marginTop: 12,
                      border: 'none',
                      borderRadius: 999,
                      padding:
                        '10px 16px',
                      background:
                        '#8b4fc1',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {finished
                      ? 'دریافت غذا'
                      : 'پخت فوری'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* MAIN CONTENT */}

      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
        }}
      >
        {/* FOOD GRID */}

        <section
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              marginBottom: 14,
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            غذاها
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 14,
            }}
          >
            {FOOD_CATALOG.map((food) => {
              const selected =
                selectedFoodId ===
                food.id;

              const available =
                canCook(food);

              return (
                <button
                  key={food.id}
                  type="button"
                  onClick={() =>
                    setSelectedFoodId(
                      food.id,
                    )
                  }
                  style={{
                    position: 'relative',
                    minHeight: 150,
                    border:
                      selected
                        ? '2px solid #e9c8ff'
                        : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 24,
                    background:
                      selected
                        ? '#63358a'
                        : '#47235d',
                    boxShadow:
                      selected
                        ? '0 10px 30px rgba(0,0,0,0.3)'
                        : '0 7px 20px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    padding: 12,
                    color: '#fff',
                    transition:
                      'transform .15s ease, background .15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'center',
                    }}
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      style={{
                        width: 82,
                        height: 82,
                        objectFit: 'contain',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      fontSize: 13,
                      fontWeight: 800,
                      lineHeight: 1.25,
                      color: '#fff',
                    }}
                  >
                    {food.name}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      display: 'inline-flex',
                      padding:
                        '4px 9px',
                      borderRadius: 999,
                      background:
                        'rgba(0,0,0,0.2)',
                      color: available
                        ? '#ead5f7'
                        : '#b9a6c4',
                      fontSize: 10,
                    }}
                  >
                    {food.timeMinutes} دقیقه
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* DETAILS PANEL */}

        {selectedFood && (
          <section
            style={{
              width: 350,
              flexShrink: 0,
              position: 'sticky',
              top: 20,
              borderRadius: 28,
              padding: 20,
              background:
                '#3b1d4f',
              border:
                '1px solid rgba(255,255,255,0.13)',
              boxShadow:
                '0 18px 45px rgba(0,0,0,0.35)',
              boxSizing: 'border-box',
            }}
          >
            {/* CLOSE */}

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedFoodId(null)
                }
                aria-label="Close"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#d9364f',
                  color: '#fff',
                  fontSize: 21,
                  fontWeight: 900,
                  lineHeight: 1,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {/* FOOD IMAGE + NAME */}

            <div
              style={{
                textAlign: 'center',
                marginTop: -8,
              }}
            >
              <div
                style={{
                  width: 125,
                  height: 125,
                  margin: '0 auto',
                  borderRadius: 28,
                  background:
                    '#4d2765',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={selectedFood.image}
                  alt={selectedFood.name}
                  style={{
                    width: 105,
                    height: 105,
                    objectFit: 'contain',
                  }}
                />
              </div>

              <h3
                style={{
                  margin:
                    '14px 0 4px',
                  color: '#fff',
                  fontSize: 20,
                }}
              >
                {selectedFood.name}
              </h3>

              <div
                style={{
                  color: '#cdb5d9',
                  fontSize: 13,
                }}
              >
                زمان پخت: {selectedFood.timeMinutes}{' '}
                دقیقه
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  marginTop: 8,
                  padding:
                    '6px 12px',
                  borderRadius: 999,
                  background:
                    'rgba(255,255,255,0.08)',
                  color: '#e4c8f1',
                  fontSize: 12,
                }}
              >
                XP +{selectedFood.xp}
              </div>
            </div>

            {/* INGREDIENTS */}

            <div
              style={{
                marginTop: 22,
              }}
            >
              <div
                style={{
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                مواد مصرفی
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection:
                    'column',
                  gap: 8,
                }}
              >
                {selectedFood.ingredients.map(
                  (ingredient) => {
                    const amount =
                      getAvailableAmount(
                        selectedFood,
                        ingredient.id,
                        ingredient.type,
                      );

                    const enough =
                      amount >=
                      ingredient.quantity;

                    return (
                      <div
                        key={`${selectedFood.id}-${ingredient.id}`}
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: 10,
                          padding:
                            '9px 11px',
                          borderRadius: 17,
                          background:
                            '#4a2760',
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius:
                              '50%',
                            background:
                              '#5c3274',
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            overflow:
                              'hidden',
                            flexShrink: 0,
                          }}
                        >
                          {ingredient.image ? (
                            <img
                              src={
                                ingredient.image
                              }
                              alt={
                                ingredient.name
                              }
                              style={{
                                width: 34,
                                height: 34,
                                objectFit:
                                  'contain',
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                fontSize: 18,
                              }}
                            >
                              ◈
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {ingredient.name}
                          </div>

                          <div
                            style={{
                              marginTop: 3,
                              color:
                                enough
                                  ? '#d8c4e4'
                                  : '#f2a9b6',
                              fontSize: 11,
                            }}
                          >
                            موجودی: {amount}
                          </div>
                        </div>

                        <div
                          style={{
                            padding:
                              '6px 10px',
                            borderRadius:
                              999,
                            background:
                              enough
                                ? '#70428b'
                                : '#713047',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 800,
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          × {ingredient.quantity}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* COOK BUTTON */}

            <button
              type="button"
              disabled={
                !canCook(selectedFood)
              }
              onClick={handleCook}
              style={{
                width: '100%',
                marginTop: 18,
                border: 'none',
                borderRadius: 999,
                padding:
                  '14px 20px',
                background:
                  canCook(selectedFood)
                    ? '#9b5dcc'
                    : '#60496b',
                color: '#fff',
                fontSize: 15,
                fontWeight: 900,
                cursor:
                  canCook(selectedFood)
                    ? 'pointer'
                    : 'not-allowed',
                boxShadow:
                  canCook(selectedFood)
                    ? '0 8px 20px rgba(155,93,204,0.3)'
                    : 'none',
              }}
            >
              {canCook(selectedFood)
                ? `پخت غذا • ${selectedFood.timeMinutes} دقیقه`
                : 'مواد اولیه کافی نیست'}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}