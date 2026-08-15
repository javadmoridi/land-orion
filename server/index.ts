import express from 'express';
import cors from 'cors';

import db from './database';

const app = express();

const PORT = 3001;

const MUNICIPAL_TAX_RATE = 0.05;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

function toNumber(
  value: unknown
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function cleanId(
  value: unknown
): string {
  return String(value ?? '').trim();
}

// ============================================================================
// HEALTH
// ============================================================================

app.get(
  '/api/health',
  (_req, res) => {
    res.json({
      ok: true,
      service: 'land-orion-marketplace',
    });
  }
);

// ============================================================================
// GET LISTINGS
// ============================================================================

app.get(
  '/api/marketplace/listings',
  (req, res) => {
    try {
      const itemType = cleanId(
        req.query.itemType
      );

      const itemId = cleanId(
        req.query.itemId
      );

      let rows;

      if (itemType && itemId) {
        rows = db
          .prepare(`
            SELECT
              id,
              seller_id AS sellerId,
              item_type AS itemType,
              item_id AS itemId,
              quantity,
              price_per_item AS pricePerItem,
              currency,
              status,
              created_at AS createdAt
            FROM listings
            WHERE status = 'active'
              AND item_type = ?
              AND item_id = ?
            ORDER BY price_per_item ASC, created_at ASC
          `)
          .all(
            itemType,
            itemId
          );
      } else if (itemType) {
        rows = db
          .prepare(`
            SELECT
              id,
              seller_id AS sellerId,
              item_type AS itemType,
              item_id AS itemId,
              quantity,
              price_per_item AS pricePerItem,
              currency,
              status,
              created_at AS createdAt
            FROM listings
            WHERE status = 'active'
              AND item_type = ?
            ORDER BY price_per_item ASC, created_at ASC
          `)
          .all(itemType);
      } else {
        rows = db
          .prepare(`
            SELECT
              id,
              seller_id AS sellerId,
              item_type AS itemType,
              item_id AS itemId,
              quantity,
              price_per_item AS pricePerItem,
              currency,
              status,
              created_at AS createdAt
            FROM listings
            WHERE status = 'active'
            ORDER BY created_at DESC
          `)
          .all();
      }

      res.json({
        ok: true,
        listings: rows,
      });
    } catch (error) {
      console.error(
        'GET listings error:',
        error
      );

      res.status(500).json({
        ok: false,
        error:
          'Failed to load marketplace listings.',
      });
    }
  }
);

// ============================================================================
// CREATE LISTING
// ============================================================================

app.post(
  '/api/marketplace/sell',
  (req, res) => {
    try {
      const sellerId = cleanId(
        req.body?.sellerId
      );

      const itemType = cleanId(
        req.body?.itemType
      );

      const itemId = cleanId(
        req.body?.itemId
      );

      const quantity = Math.floor(
        toNumber(
          req.body?.quantity
        )
      );

      const pricePerItem =
        toNumber(
          req.body?.pricePerItem
        );

      const currency =
        cleanId(
          req.body?.currency
        ) ||
        'orion-token';

      if (!sellerId) {
        return res.status(400).json({
          ok: false,
          error:
            'sellerId is required.',
        });
      }

      if (!itemType) {
        return res.status(400).json({
          ok: false,
          error:
            'itemType is required.',
        });
      }

      if (!itemId) {
        return res.status(400).json({
          ok: false,
          error:
            'itemId is required.',
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          ok: false,
          error:
            'Quantity must be greater than 0.',
        });
      }

      if (
        pricePerItem <= 0
      ) {
        return res.status(400).json({
          ok: false,
          error:
            'Price per item must be greater than 0.',
        });
      }

      const result =
        db
          .prepare(`
            INSERT INTO listings (
              seller_id,
              item_type,
              item_id,
              quantity,
              price_per_item,
              currency,
              status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'active')
          `)
          .run(
            sellerId,
            itemType,
            itemId,
            quantity,
            pricePerItem,
            currency
          );

      return res.status(201).json({
        ok: true,
        listing: {
          id: Number(
            result.lastInsertRowid
          ),
          sellerId,
          itemType,
          itemId,
          quantity,
          pricePerItem,
          currency,
          status: 'active',
        },
      });
    } catch (error) {
      console.error(
        'SELL error:',
        error
      );

      return res.status(500).json({
        ok: false,
        error:
          'Failed to create listing.',
      });
    }
  }
);

// ============================================================================
// BUY
// ============================================================================

app.post(
  '/api/marketplace/buy',
  (req, res) => {
    const transaction =
      db.transaction(
        () => {
          const buyerId =
            cleanId(
              req.body?.buyerId
            );

          const listingId =
            Math.floor(
              toNumber(
                req.body?.listingId
              )
            );

          const quantityRequested =
            Math.floor(
              toNumber(
                req.body?.quantity
              )
            );

          if (!buyerId) {
            throw new Error(
              'buyerId is required.'
            );
          }

          if (
            listingId <= 0
          ) {
            throw new Error(
              'listingId is required.'
            );
          }

          if (
            quantityRequested <= 0
          ) {
            throw new Error(
              'Quantity must be greater than 0.'
            );
          }

          const listing =
            db
              .prepare(`
                SELECT
                  id,
                  seller_id AS sellerId,
                  item_type AS itemType,
                  item_id AS itemId,
                  quantity,
                  price_per_item AS pricePerItem,
                  currency,
                  status
                FROM listings
                WHERE id = ?
                LIMIT 1
              `)
              .get(
                listingId
              ) as
              | {
                  id: number;
                  sellerId: string;
                  itemType: string;
                  itemId: string;
                  quantity: number;
                  pricePerItem: number;
                  currency: string;
                  status: string;
                }
              | undefined;

          if (!listing) {
            throw new Error(
              'Listing not found.'
            );
          }

          if (
            listing.status !==
            'active'
          ) {
            throw new Error(
              'Listing is not active.'
            );
          }

          if (
            listing.sellerId ===
            buyerId
          ) {
            throw new Error(
              'Seller cannot buy their own listing.'
            );
          }

          const quantity =
            Math.min(
              quantityRequested,
              listing.quantity
            );

          const grossAmount =
            quantity *
            listing.pricePerItem;

          const taxAmount =
            grossAmount *
            MUNICIPAL_TAX_RATE;

          const sellerAmount =
            grossAmount -
            taxAmount;

          db.prepare(`
            INSERT INTO sales (
              listing_id,
              seller_id,
              buyer_id,
              item_type,
              item_id,
              quantity,
              gross_amount,
              tax_amount,
              seller_amount
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            listing.id,
            listing.sellerId,
            buyerId,
            listing.itemType,
            listing.itemId,
            quantity,
            grossAmount,
            taxAmount,
            sellerAmount
          );

          const sale =
            db
              .prepare(`
                SELECT id
                FROM sales
                WHERE listing_id = ?
                ORDER BY id DESC
                LIMIT 1
              `)
              .get(
                listing.id
              ) as {
              id: number;
            };

          db.prepare(`
            INSERT INTO pending_earnings (
              seller_id,
              sale_id,
              amount,
              claimed
            )
            VALUES (?, ?, ?, 0)
          `).run(
            listing.sellerId,
            sale.id,
            sellerAmount
          );

          const remaining =
            listing.quantity -
            quantity;

          if (
            remaining <= 0
          ) {
            db.prepare(`
              UPDATE listings
              SET
                quantity = 0,
                status = 'sold'
              WHERE id = ?
            `).run(
              listing.id
            );
          } else {
            db.prepare(`
              UPDATE listings
              SET quantity = ?
              WHERE id = ?
            `).run(
              remaining,
              listing.id
            );
          }

          return {
            saleId: sale.id,
            listingId:
              listing.id,
            buyerId,
            sellerId:
              listing.sellerId,
            itemType:
              listing.itemType,
            itemId:
              listing.itemId,
            quantity,
            grossAmount,
            taxAmount,
            sellerAmount,
            currency:
              listing.currency,
          };
        }
      );

    try {
      const result =
        transaction();

      return res.json({
        ok: true,
        sale: result,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Purchase failed.';

      return res.status(400).json({
        ok: false,
        error: message,
      });
    }
  }
);

// ============================================================================
// GET PENDING EARNINGS
// ============================================================================

app.get(
  '/api/marketplace/earnings',
  (req, res) => {
    try {
      const sellerId =
        cleanId(
          req.query.sellerId
        );

      if (!sellerId) {
        return res.status(400).json({
          ok: false,
          error:
            'sellerId is required.',
        });
      }

      const earnings =
        db
          .prepare(`
            SELECT
              id,
              sale_id AS saleId,
              amount,
              claimed,
              created_at AS createdAt,
              claimed_at AS claimedAt
            FROM pending_earnings
            WHERE seller_id = ?
            ORDER BY created_at DESC
          `)
          .all(
            sellerId
          );

      const total =
        earnings.reduce(
          (
            sum,
            row
          ) =>
            sum +
            Number(
              (
                row as {
                  amount: number;
                }
              ).amount
            ),
          0
        );

      const unclaimed =
        earnings.reduce(
          (
            sum,
            row
          ) => {
            const item =
              row as {
                amount: number;
                claimed: number;
              };

            return (
              sum +
              (item.claimed
                ? 0
                : item.amount)
            );
          },
          0
        );

      return res.json({
        ok: true,
        earnings,
        total,
        unclaimed,
      });
    } catch (error) {
      console.error(
        'GET earnings error:',
        error
      );

      return res.status(500).json({
        ok: false,
        error:
          'Failed to load earnings.',
      });
    }
  }
);

// ============================================================================
// CLAIM EARNINGS
// ============================================================================

app.post(
  '/api/marketplace/earnings/claim',
  (req, res) => {
    const transaction =
      db.transaction(
        () => {
          const sellerId =
            cleanId(
              req.body?.sellerId
            );

          if (!sellerId) {
            throw new Error(
              'sellerId is required.'
            );
          }

          const earnings =
            db
              .prepare(`
                SELECT
                  id,
                  amount
                FROM pending_earnings
                WHERE seller_id = ?
                  AND claimed = 0
              `)
              .all(
                sellerId
              ) as Array<{
              id: number;
              amount: number;
            }>;

          if (
            earnings.length ===
            0
          ) {
            throw new Error(
              'No pending earnings to claim.'
            );
          }

          const total =
            earnings.reduce(
              (
                sum,
                item
              ) =>
                sum +
                Number(
                  item.amount
                ),
              0
            );

          const ids =
            earnings.map(
              (item) =>
                item.id
            );

          const update =
            db.prepare(`
              UPDATE pending_earnings
              SET
                claimed = 1,
                claimed_at = CURRENT_TIMESTAMP
              WHERE id = ?
                AND seller_id = ?
                AND claimed = 0
            `);

          for (
            const id of ids
          ) {
            update.run(
              id,
              sellerId
            );
          }

          return {
            sellerId,
            claimedAmount:
              total,
            count:
              earnings.length,
          };
        }
      );

    try {
      const result =
        transaction();

      return res.json({
        ok: true,
        claim: result,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Claim failed.';

      return res.status(400).json({
        ok: false,
        error: message,
      });
    }
  }
);

// ============================================================================
// SERVER
// ============================================================================

app.listen(
  PORT,
  () => {
    console.log(
      `Marketplace server running on http://localhost:${PORT}`
    );
  }
);