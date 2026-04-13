export const getUser = () => {
    return JSON.parse(localStorage.getItem("userInfo"));
};

export const isAuthenticated = () => {
    return !!localStorage.getItem("userInfo");
};

export const logoutUser = () => {
    localStorage.removeItem("userInfo");
};