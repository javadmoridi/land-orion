import { create } from 'zustand';


interface MarketplaceTestState {

  hostTokens:number;
  hostGems:number;

  addHostTokens:(amount:number)=>void;
  addHostGems:(amount:number)=>void;

}


export const useMarketplaceTestStore =
create<MarketplaceTestState>((set)=>({

  hostTokens:10000,

  hostGems:500,


  addHostTokens:(amount)=>{

    set((state)=>({

      hostTokens:
      state.hostTokens + amount

    }));

  },


  addHostGems:(amount)=>{

    set((state)=>({

      hostGems:
      state.hostGems + amount

    }));

  },


}));