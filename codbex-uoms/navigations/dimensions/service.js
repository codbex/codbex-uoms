const navigationData = {
    id: 'dimensions-navigation',
    label: "Dimensions",
    group: "metadata",
    order: 300,
    link: "/services/web/codbex-uoms/gen/codbex-uoms/ui/Dimensions/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }