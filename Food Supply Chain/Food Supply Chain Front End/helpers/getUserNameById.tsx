import useUsersStore from "@/store/users.store";

const GetUserName: React.FC<any> = ({ id }: any) => {
    const users = useUsersStore((state) => state.users);

    const findUsername = (id: string) => {
        return users.find(u => u?.id === id)?.name || 'No User';
    }

    return (
        <span>{findUsername(id)}</span>
    );
}

export default GetUserName;
