import type { InventoryItem } from '../types';
import { useResourceStore } from '../economy/resourceStore';


// ساخت آیتم
export function createInventoryItem(
  id: string,
  name: string,
  quantity = 1,
  type: InventoryItem['type'] = 'base'
): InventoryItem {
  return {
    id,
    name,
    type,
    quantity,
    rarity: 'common',
  };
}


// گرفتن کل اینونتوری
export function getInventory(): InventoryItem[] {
  return (
    useResourceStore.getState().inventory ?? []
  );
}


// اضافه کردن آیتم
export function addInventoryItem(
  item: InventoryItem
): void {

  const store = useResourceStore.getState();
  const inventory = store.inventory ?? [];

  const old = inventory.find(
    i => i.id === item.id
  );


  if(old){

    store.setInventory(
      inventory.map(i =>
        i.id === item.id
        ? {
            ...i,
            quantity:i.quantity + item.quantity
          }
        : i
      )
    );

  }else{

    store.setInventory([
      ...inventory,
      item
    ]);

  }
}


// کم کردن آیتم (برای فروش)
export function removeInventoryItem(
  id:string,
  quantity:number
):boolean{

  const store = useResourceStore.getState();

  const inventory = store.inventory ?? [];


  const item = inventory.find(
    i=>i.id===id
  );


  if(!item || item.quantity < quantity)
    return false;


  store.setInventory(
    inventory
    .map(i=>
      i.id===id
      ? {
          ...i,
          quantity:i.quantity-quantity
        }
      : i
    )
    .filter(
      i=>i.quantity>0
    )
  );


  return true;
}



// تعداد آیتم
export function getInventoryAmount(
  id:string
):number{

  return (
    getInventory()
    .find(i=>i.id===id)
    ?.quantity ?? 0
  );

}



// دریافت آیتم خریداری شده از مارکت
export function receiveMarketplaceItem(
  itemId:string,
  name:string,
  quantity:number
){

  addInventoryItem(
    createInventoryItem(
      itemId,
      name,
      quantity
    )
  );

}



// آماده کردن آیتم برای فروش
// اول از اینونتوری کم میکند
export function prepareMarketplaceSale(
  itemId:string,
  quantity:number
):boolean{

  return removeInventoryItem(
    itemId,
    quantity
  );

}



// برگشت آیتم وقتی فروش لغو شد
export function refundMarketplaceItem(
  itemId:string,
  name:string,
  quantity:number
){

  addInventoryItem(
    createInventoryItem(
      itemId,
      name,
      quantity
    )
  );

}



// انتقال آیتم بین بازیکن ها
export function transferItem(
  fromId:string,
  toItem:InventoryItem
):boolean{

  const removed =
    removeInventoryItem(
      fromId,
      toItem.quantity
    );


  if(!removed)
    return false;


  addInventoryItem(
    toItem
  );


  return true;
}