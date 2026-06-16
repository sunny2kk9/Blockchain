import { create } from 'zustand'
import User from '@/interfaces/user.interface';
import { devtools, persist } from 'zustand/middleware'

interface UserStoreState {
    user: User
    setUser: (payload: User) => void;
    removeUser: () => void;
}

const initialState: User = {
    email: "",
    govtId: "",
    id: "",
    name: "",
    phone: "",
    userAddress: "",
};

const useUserStore = create<UserStoreState>()(
    devtools(
      persist(
        (set) => ({
            user: initialState,
            setUser: (payload: User) => set((state: any) => ({ ...state, user: payload })),
            removeUser: () => set({ user: initialState }),
        }),
        { name: 'userStore' },
      ),
    ),
  )

export default useUserStore;