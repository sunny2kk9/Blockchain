import { create } from 'zustand';

interface LoadingState {
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

const useLoadingStore = create<LoadingState>((set) => ({
    isLoading: false,
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));

export default useLoadingStore;