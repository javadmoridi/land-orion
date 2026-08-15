// =============================================================================
// Marketplace data layer (buy / sell between players)
// Connected with Inventory system
// =============================================================================

import { supabase, isSupabaseConfigured } from './supabaseClient';

import {
  prepareMarketplaceSale,
  receiveMarketplaceItem,
  refundMarketplaceItem,
} from '../inventory/inventoryService';


export const MARKETPLACE_TAX_RATE = 0.05;


export interface MarketplaceListing {
  id: number;
  sellerId: string;
  itemType: string;
  itemId: string;
  quantity: number;
  pricePerItem: number;
  currency: string;
  status: string;
  createdAt?: string;
}


export interface MarketplaceSale {
  saleId: number;
  listingId: number;
  buyerId: string;
  sellerId: string;
  itemType: string;
  itemId: string;
  quantity: number;
  grossAmount: number;
  taxAmount: number;
  sellerAmount: number;
  currency: string;
}



// ===============================
// Local Storage
// ===============================

const LOCAL_KEY =
  'land-orion-marketplace-listings';


function readLocal(): MarketplaceListing[] {

  if(typeof window === 'undefined')
    return [];


  try{

    const raw =
      window.localStorage.getItem(
        LOCAL_KEY
      );

    return raw
      ? JSON.parse(raw)
      : [];

  }catch{

    return [];

  }

}



function writeLocal(
  listings:MarketplaceListing[]
){

  if(typeof window === 'undefined')
    return;


  try{

    window.localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify(listings)
    );

  }catch{}

}



// ===============================
// Supabase
// ===============================


async function supabaseGetListings(){

  if(
    !isSupabaseConfigured ||
    !supabase
  )
    return null;


  const {
    data,
    error
  } =
  await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('status','active');


  if(error)
    return null;


  return data as MarketplaceListing[];

}




async function supabaseCreateListing(
 params:any
){

 if(
   !isSupabaseConfigured ||
   !supabase
 )
 return null;



 const {
   data,
   error
 }
 =
 await supabase.rpc(
   'marketplace_sell',
   {
    p_seller_id:params.sellerId,
    p_item_type:params.itemType,
    p_item_id:params.itemId,
    p_quantity:params.quantity,
    p_price_per_item:params.pricePerItem,
   }
 );


 if(error)
   return null;


 return data as MarketplaceListing;

}




async function supabaseBuyListing(
 listingId:number,
 buyerId:string,
 quantity:number
){

 if(
   !isSupabaseConfigured ||
   !supabase
 )
 return null;


 const {
  data,
  error
 }
 =
 await supabase.rpc(
  'marketplace_buy',
  {
    p_buyer_id:buyerId,
    p_listing_id:listingId,
    p_quantity:quantity
  }
 );


 if(error)
   return null;


 return data as MarketplaceSale;

}




// ===============================
// HTTP Server
// ===============================


const MARKETPLACE_BASE =
(import.meta.env?.VITE_MARKETPLACE_URL as string)
||
'http://localhost:3001';



async function httpJson(
 input:RequestInfo | URL,
 init?:RequestInit
){

 const response =
 await fetch(
   input,
   {
    ...init,
    headers:{
      'Content-Type':'application/json',
      ...(init?.headers ?? {})
    }
   }
 );


 const body =
 await response.json()
 .catch(()=>({}));


 if(!response.ok)
 {
   throw new Error(
    body?.error ??
    'Marketplace error'
   );
 }


 return body;

}




// ===============================
// GET LISTINGS
// ===============================


export async function getListings(
 itemType?:string,
 itemId?:string
):Promise<MarketplaceListing[]>{


 const supabaseRows =
 await supabaseGetListings();


 if(supabaseRows){

  return supabaseRows.filter(row=>{

    if(
      itemType &&
      row.itemType!==itemType
    )
    return false;


    if(
      itemId &&
      row.itemId!==itemId
    )
    return false;


    return true;

  });

 }



 try{


 const params =
 new URLSearchParams();


 if(itemType)
 params.set(
  'itemType',
  itemType
 );


 if(itemId)
 params.set(
  'itemId',
  itemId
 );


 const data =
 await httpJson(
 `${MARKETPLACE_BASE}/api/marketplace/listings?${params}`
 );


 if(data?.listings)
 return data.listings;


 }catch{}



 return readLocal()
 .filter(row=>{

  if(row.status!=='active')
  return false;


  if(
   itemType &&
   row.itemType!==itemType
  )
  return false;


  if(
   itemId &&
   row.itemId!==itemId
  )
  return false;


  return true;

 });

}




// ===============================
// CREATE SELL LISTING
// ===============================


export async function createListing(
 params:{
 sellerId:string;
 itemType:string;
 itemId:string;
 quantity:number;
 pricePerItem:number;
 currency?:string;
 }
):Promise<MarketplaceListing>{


 // کم کردن از اینونتوری
 const removed =
 prepareMarketplaceSale(
   params.itemId,
   params.quantity
 );


 if(!removed)
 {
  throw new Error(
   'Not enough inventory'
  );
 }



 const supabaseRow =
 await supabaseCreateListing(
  params
 );


 if(supabaseRow)
 return supabaseRow;



 try{


 const data =
 await httpJson(
 `${MARKETPLACE_BASE}/api/marketplace/sell`,
 {
  method:'POST',
  body:JSON.stringify({
   ...params,
   currency:
   params.currency ??
   'orion-token'
  })
 });


 if(data?.listing)
 return data.listing;


 }catch{}





 const listing:MarketplaceListing={
  id:Date.now(),
  sellerId:params.sellerId,
  itemType:params.itemType,
  itemId:params.itemId,
  quantity:params.quantity,
  pricePerItem:params.pricePerItem,
  currency:
   params.currency ??
   'orion-token',
  status:'active',
  createdAt:
   new Date().toISOString()
 };


 writeLocal([
  ...readLocal(),
  listing
 ]);


 return listing;

}// ===============================
// BUY LISTING
// ===============================


export async function buyListing(
 params:{
  buyerId:string;
  listingId:number;
  quantity:number;
 }
):Promise<MarketplaceSale>{



 const supabaseSale =
 await supabaseBuyListing(
  params.listingId,
  params.buyerId,
  params.quantity
 );


 if(supabaseSale)
 {

  receiveMarketplaceItem(
   supabaseSale.itemId,
   supabaseSale.itemId,
   params.quantity
  );


  return supabaseSale;

 }





 try{


 const data =
 await httpJson(
 `${MARKETPLACE_BASE}/api/marketplace/buy`,
 {
  method:'POST',
  body:JSON.stringify(params)
 });


 if(data?.sale)
 {

  receiveMarketplaceItem(
   data.sale.itemId,
   data.sale.itemId,
   params.quantity
  );


  return data.sale;

 }


 }catch{}





 const local =
 readLocal();


 const target =
 local.find(
  row=>row.id===params.listingId
 );


 if(!target)
 {
  throw new Error(
   'Listing not found'
  );
 }



 const remaining =
 Math.max(
  0,
  target.quantity -
  params.quantity
 );



 writeLocal(

 local
 .map(row=>

  row.id===params.listingId

  ?

  {
   ...row,
   quantity:remaining
  }

  :

  row

 )
 .filter(
  row=>row.quantity>0
 )

 );





 // اضافه کردن آیتم به خریدار

 receiveMarketplaceItem(
  target.itemId,
  target.itemId,
  params.quantity
 );





 const grossAmount =
 target.pricePerItem *
 params.quantity;


 const taxAmount =
 Math.round(
  grossAmount *
  MARKETPLACE_TAX_RATE *
  100
 )
 /100;


 return {

  saleId:Date.now(),

  listingId:
   target.id,

  buyerId:
   params.buyerId,

  sellerId:
   target.sellerId,

  itemType:
   target.itemType,

  itemId:
   target.itemId,

  quantity:
   params.quantity,

  grossAmount,

  taxAmount,

  sellerAmount:
   grossAmount-taxAmount,

  currency:
   target.currency

 };

}




// ===============================
// CANCEL LISTING
// ===============================


export async function cancelListing(
 params:{
  sellerId:string;
  listingId:number;
 }
):Promise<boolean>{


 const local =
 readLocal();


 const target =
 local.find(
  row=>row.id===params.listingId
 );



 if(target)
 {

  refundMarketplaceItem(
   target.itemId,
   target.itemId,
   target.quantity
  );


  writeLocal(
   local.filter(
    row=>
    row.id!==params.listingId
   )
  );


  return true;

 }



 try{


 const data =
 await httpJson(
 `${MARKETPLACE_BASE}/api/marketplace/cancel`,
 {
  method:'POST',
  body:JSON.stringify(params)
 });


 return !!data?.ok;


 }catch{

  return false;

 }

}