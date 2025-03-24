const navigationData = {
    id: 'dimensions-navigation',
    label: "Dimensions",
    group: "reference data",
    order: 400,
    link: "/services/web/codbex-uoms/gen/codbex-uoms/ui/Dimensions/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }
