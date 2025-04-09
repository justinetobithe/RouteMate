export const useSelectedRoutesStore = set => ({
    selected_routes: [],
    addSelectedRoute: item =>
        set(state => ({ selected_routes: [item, ...state.selected_routes] })),
    removeSelectedRoute: id =>
        set(state => ({
            selected_routes: state.selected_routes.filter(item => item !== id),
        })),
});
