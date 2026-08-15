import { useEffect, useState } from 'react';
import {
  getMarketplaceListings,
  buyItem,
} from '../backend/marketplaceService';

interface Listing {
  id: string;
  seller_id: string;
  item_type: string;
  item_id: string;
  quantity: number;
  price_per_item: number;
  currency: string;
}

interface MarketplaceProps {
  playerId: string;
}

export default function Marketplace({
  playerId,
}: MarketplaceProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadMarket() {
    const data =
      await getMarketplaceListings();

    setListings(
      (data ?? []) as Listing[]
    );
  }

  async function handleBuy(
    listing: Listing
  ) {
    try {
      setLoading(true);

      const result =
        await buyItem(
          playerId,
          listing.id,
          1
        );

      console.log(
        'BUY RESULT',
        result
      );

      await loadMarket();

    } catch (error) {
      console.error(
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarket();
  }, []);

  return (
    <div>
      <h2>
        Orion Marketplace
      </h2>

      {listings.map(
        (item) => (
          <div
            key={item.id}
          >
            <p>
              {item.item_id}
            </p>

            <p>
              مقدار:
              {item.quantity}
            </p>

            <p>
              قیمت:
              {item.price_per_item}
              {' '}
              {item.currency}
            </p>

            <button
              disabled={loading}
              onClick={() =>
                handleBuy(item)
              }
            >
              خرید
            </button>
          </div>
        )
      )}
    </div>
  );
}