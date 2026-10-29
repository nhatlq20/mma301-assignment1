// MMA301 - Le Quang Nhat - CE190875
import { useState } from 'react';
import { FlatList } from 'react-native';
import ActivityItem from '../components/ActivityItem';
import EmptyState from '../components/EmptyState';

const initialData = [
    { id: '1', title: 'Đọc sách', done: false },
    { id: '2', title: 'Tập gym', done: false },
];

export default function ActivityScreen() {
    const [activities, setActivities] = useState(initialData); // đổi thành [] để test empty state

    const toggleItem = (id) => {
        setActivities(prev =>
            prev.map(item => item.id === id ? { ...item, done: !item.done } : item) // immutable
        );
    };

    if (activities.length === 0) return <EmptyState message="Chưa có hoạt động nào" />;

    return (
        <FlatList
            data={activities}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ActivityItem item={item} onToggle={toggleItem} />}
        />
    );
}