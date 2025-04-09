import { create } from 'zustand';
// import { useUserStore } from './useUserStore';
import { useSelectedRoutesStore } from './useSelectedRoutesStore';
import { devtools } from 'zustand/middleware';

export const store = create(
    devtools((set, get, api) => ({
        // ...useUserStore(set, get, api),
        ...useSelectedRoutesStore(set, get, api),
    })),
);
