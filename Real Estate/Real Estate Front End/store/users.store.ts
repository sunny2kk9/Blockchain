import { create } from 'zustand'
import User from '@/interfaces/user.interface';
import { devtools, persist } from 'zustand/middleware'

interface UsersStoreState {
    users: User[]
    setUsers: (payload: User) => void;
    removeUsers: () => void;
}

const initialState: User[] = [];

const useUsersStore = create<UsersStoreState>()(
    devtools(
      persist(
        (set) => ({
            users: initialState,
            setUsers: (payload: User) => set((state: any) => ({...state, users: payload})),
            removeUsers: () => set({ users: initialState }),
        }),
        { name: 'usersStore' },
      ),
    ),
  )

export default useUsersStore;