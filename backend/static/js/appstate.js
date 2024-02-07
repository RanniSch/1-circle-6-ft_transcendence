const appState = {
    isLoggedIn: false,
    userProfile: null,
    notifications: [],
    userList: [],
};

const listeners = [];

export function subscribe(listener) {
    listeners.push(listener);
}

export function notifyListeners() {
    listeners.forEach(listener => listener());
}

export default appState;