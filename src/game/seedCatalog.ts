export interface Seed {
  id: string;
  name: string;
  image: string;
  price: number;      // Coin
  growTime: number;   // seconds
}

export const SEEDS: Seed[] = [
  { id:'seed-1', name:'Seed 1', image:'/assets/seed-1.png', price:1, growTime:300 },
  { id:'seed-2', name:'Seed 2', image:'/assets/seed-2.png', price:2, growTime:600 },
  { id:'seed-3', name:'Seed 3', image:'/assets/seed-3.png', price:5, growTime:900 },
  { id:'seed-4', name:'Seed 4', image:'/assets/seed-4.png', price:10, growTime:1500 },
  { id:'seed-5', name:'Seed 5', image:'/assets/seed-5.png', price:20, growTime:2700 },

  { id:'seed-6', name:'Seed 6', image:'/assets/seed-6.png', price:35, growTime:3600 },
  { id:'seed-7', name:'Seed 7', image:'/assets/seed-7.png', price:50, growTime:5400 },
  { id:'seed-8', name:'Seed 8', image:'/assets/seed-8.png', price:75, growTime:7200 },
  { id:'seed-9', name:'Seed 9', image:'/assets/seed-9.png', price:100, growTime:10800 },
  { id:'seed-10', name:'Seed 10', image:'/assets/seed-10.png', price:150, growTime:14400 },

  { id:'seed-11', name:'Seed 11', image:'/assets/seed-11.png', price:200, growTime:18000 },
  { id:'seed-12', name:'Seed 12', image:'/assets/seed-12.png', price:250, growTime:21600 },
  { id:'seed-13', name:'Seed 13', image:'/assets/seed-13.png', price:300, growTime:28800 },
  { id:'seed-14', name:'Seed 14', image:'/assets/seed-14.png', price:400, growTime:36000 },
  { id:'seed-15', name:'Seed 15', image:'/assets/seed-15.png', price:500, growTime:43200 },

  { id:'seed-16', name:'Seed 16', image:'/assets/seed-16.png', price:700, growTime:50400 },
  { id:'seed-17', name:'Seed 17', image:'/assets/seed-17.png', price:900, growTime:57600 },
  { id:'seed-18', name:'Seed 18', image:'/assets/seed-18.png', price:1200, growTime:64800 },
  { id:'seed-19', name:'Seed 19', image:'/assets/seed-19.png', price:1500, growTime:72000 },
  { id:'seed-20', name:'Seed 20', image:'/assets/seed-20.png', price:2000, growTime:75600 },

  { id:'seed-21', name:'Seed 21', image:'/assets/seed-21.png', price:2500, growTime:79200 },
  { id:'seed-22', name:'Seed 22', image:'/assets/seed-22.png', price:3000, growTime:82800 },
  { id:'seed-23', name:'Seed 23', image:'/assets/seed-23.png', price:4000, growTime:84600 },
  { id:'seed-24', name:'Seed 24', image:'/assets/seed-24.png', price:5000, growTime:85500 },
  { id:'seed-25', name:'Seed 25', image:'/assets/seed-25.png', price:7500, growTime:86400 },
];