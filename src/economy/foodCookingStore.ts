import { create } from 'zustand';

import { useGameStore } from '../game/useGameStore';
import { useResourceStore } from './resourceStore';
import { useVipStore } from './vipStore';

import {
  getFoodById,
  createFoodInventoryItem,
  type FoodDefinition,
} from './foodCatalog';


export interface CookingJob {
  id: string;
  foodId: string;
  queuedAt: number;
  startedAt: number | null;
  finishAt: number | null;
  completed: boolean;
}


interface FoodCookingStoreState {
  jobs: CookingJob[];

  cookFood: (food: FoodDefinition) => boolean;

  quickCook: (jobId: string) => boolean;

  collectFinishedFood: (jobId: string) => boolean;

  getJob: (jobId: string) => CookingJob | undefined;

  isFinished: (jobId: string) => boolean;

  getRemainingSeconds: (jobId: string) => number;

  getQuickCookCost: (timeMinutes: number) => number;

  reset: () => void;
}


const STORAGE_KEY =
  'land-orion-food-cooking';


const NORMAL_QUEUE_LIMIT = 1;
const VIP_QUEUE_LIMIT = 5;



function loadJobs(): CookingJob[] {

  if (typeof window === 'undefined') {
    return [];
  }


  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!raw) {
      return [];
    }


    const data =
      JSON.parse(raw);


    if (!Array.isArray(data)) {
      return [];
    }


    return data.filter(
      (job) =>
        job &&
        typeof job.id === 'string' &&
        typeof job.foodId === 'string' &&
        typeof job.queuedAt === 'number'
    );


  } catch {

    return [];

  }
}



function saveJobs(
  jobs: CookingJob[]
) {

  if (
    typeof window === 'undefined'
  ) {
    return;
  }


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(jobs)
  );

}
function getInventory() {
  return (
    useGameStore.getState().gameState?.inventory ??
    useGameStore.getState().playerProfile?.inventory ??
    []
  );
}


function hasIngredient(
  id: string,
  quantity: number,
  type: 'inventory' | 'resource'
) {

  if (type === 'inventory') {

    const item =
      getInventory().find(
        (x) => x.id === id
      );

    return !!item &&
      item.quantity >= quantity;

  }


  const resources =
    useResourceStore.getState().resources;


  return (
    resources[
      id as keyof typeof resources
    ] ?? 0
  ) >= quantity;

}



function removeIngredient(
  id: string,
  quantity: number,
  type: 'inventory' | 'resource'
) {

  if (type === 'inventory') {

    return useGameStore
      .getState()
      .removeFromInventory(
        id,
        quantity
      );

  }


  const store =
    useResourceStore.getState();


  switch (id) {

    case 'wood':
      return store.spendWood(quantity);

    case 'stone':
      return store.spendStone(quantity);

    case 'iron':
      return store.spendIron(quantity);

    case 'gold':
      return store.spendGold(quantity);

    case 'crystal':
      return store.spendCrystal(quantity);

    default:

      return useGameStore
        .getState()
        .spendResource(
          id,
          quantity
        );

  }

}



function hasAllIngredients(
  food: FoodDefinition
) {

  return food.ingredients.every(
    (item) =>
      hasIngredient(
        item.id,
        item.quantity,
        item.type
      )
  );

}



function removeAllIngredients(
  food: FoodDefinition
) {

  for (
    const item of food.ingredients
  ) {

    const removed =
      removeIngredient(
        item.id,
        item.quantity,
        item.type
      );


    if (!removed) {
      return false;
    }

  }


  return true;

}



function startNextJob(
  jobs: CookingJob[]
) {

  const running =
    jobs.some(
      (job) =>
        job.startedAt !== null &&
        !job.completed
    );


  if (running) {
    return jobs;
  }



  const next =
    jobs.find(
      (job) =>
        job.startedAt === null &&
        !job.completed
    );


  if (!next) {
    return jobs;
  }



  const food =
    getFoodById(
      next.foodId
    );


  if (!food) {
    return jobs;
  }



  const now =
    Date.now();



  return jobs.map(
    (job) =>
      job.id === next.id
        ? {
            ...job,
            startedAt: now,
            finishAt:
              now +
              food.timeMinutes *
              60 *
              1000
          }
        : job
  );

}



export const useFoodCookingStore =
create<FoodCookingStoreState>(
(set,get)=>({

jobs:
  loadJobs(),



cookFood:(food)=>{


  const vip =
    useVipStore
      .getState()
      .isVipActive();



  const limit =
    vip
      ? VIP_QUEUE_LIMIT
      : NORMAL_QUEUE_LIMIT;



  const jobs =
    get().jobs;



  if (
    jobs.length >= limit
  ) {

    return false;

  }



  if (
    !hasAllIngredients(food)
  ) {

    return false;

  }



  if (
    !removeAllIngredients(food)
  ) {

    return false;

  }



  const now =
    Date.now();



  const job: CookingJob = {

    id:
      `cooking-${food.id}-${now}`,

    foodId:
      food.id,

    queuedAt:
      now,

    startedAt:
      null,

    finishAt:
      null,

    completed:
      false

  };



  let updated =
    [
      ...jobs,
      job
    ];



  updated =
    startNextJob(updated);



  saveJobs(updated);


  set({
    jobs: updated
  });


  return true;

},



collectFinishedFood:(jobId)=>{


 const job =
   get().getJob(jobId);


 if(!job) {
   return false;
 }


 if(
   job.finishAt === null ||
   Date.now() < job.finishAt
 ){
   return false;
 }



 const food =
   getFoodById(
     job.foodId
   );


 if(!food){
   return false;
 }



 useGameStore
 .getState()
 .addToInventory(
   createFoodInventoryItem(
     food,
     1
   )
 );



 let jobs =
   get().jobs.filter(
     x=>x.id!==jobId
   );



 jobs =
   startNextJob(jobs);



 saveJobs(jobs);



 set({
   jobs
 });



 return true;


},



getJob:(id)=>
 get().jobs.find(
   x=>x.id===id
 ),



isFinished:(id)=>{

 const job =
   get().getJob(id);


 return !!job &&
 job.finishAt !== null &&
 Date.now() >= job.finishAt;

},



getRemainingSeconds:(id)=>{

 const job =
   get().getJob(id);


 if(
   !job ||
   job.finishAt===null
 ){
   return 0;
 }


 return Math.max(
   0,
   Math.ceil(
    (job.finishAt-Date.now())/1000
   )
 );

},



quickCook:(id)=>{

 const job =
   get().getJob(id);


 if(!job){
   return false;
 }


 const cost =
   get().getQuickCookCost(
    get().getRemainingSeconds(id)/60
   );


 const paid =
   useResourceStore
   .getState()
   .spendGems(cost);



 if(!paid){
   return false;
 }



 const jobs =
 get().jobs.map(
 x=>x.id===id
 ? {
    ...x,
    finishAt:Date.now()
 }
 :x
 );



 saveJobs(jobs);


 set({
  jobs
 });


 return true;


},



getQuickCookCost:(minutes)=>
 Math.ceil(minutes/5),



reset:()=>{

 saveJobs([]);

 set({
  jobs:[]
 });

}


})
);