import { create } from 'zustand';
import api from '../api';

const useTripRatingStore = create((set) => ({
    tripRatings: [],
    isLoading: false,
    error: null,
    currentBooking: null,

    addTripRating: async (formData, showToast = null, navigation = null) => {
        set({ isLoading: true, error: null });

        console.log("form Data", formData);
        try {
            const res = await api.post('/api/trip-rating', formData);

            if (res.data.status) {
                set((state) => ({
                    tripRatings: [...state.tripRatings, res.data.data],
                }));
                if (showToast) {
                    showToast(res.data.message, "success");
                }
                if (navigation) {
                    navigation.goBack();
                }
            } else {
                console.log("Backend error:", res.data.message);
                if (showToast) {
                    showToast(res.data.message, "error");
                }
            }
        } catch (e) {
            console.error(`addTripRating error: ${e}`);
            if (showToast) {
                showToast(`Failed to add booking: ${e.message}`, "error");
            }
            set({ error: e.message });
        } finally {
            set({ isLoading: false });
        }
    },


}));

export default useTripRatingStore;
