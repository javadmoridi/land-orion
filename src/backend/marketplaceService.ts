import { supabase } from './supabaseClient';

export async function sellItem(
  sellerId: string,
  itemType: string,
  itemId: string,
  quantity: number,
  price: number
) {
  const { data, error } = await supabase!.rpc(
    'marketplace_sell',
    {
      p_seller_id: sellerId,
      p_item_type: itemType,
      p_item_id: itemId,
      p_quantity: quantity,
      p_price_per_item: price,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}


export async function buyItem(
  buyerId: string,
  listingId: string,
  quantity: number
) {
  const { data, error } = await supabase!.rpc(
    'marketplace_buy',
    {
      p_buyer_id: buyerId,
      p_listing_id: listingId,
      p_quantity: quantity,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}


export async function getMarketplaceListings() {
  const { data, error } = await supabase!
    .from('marketplace_listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data;
}