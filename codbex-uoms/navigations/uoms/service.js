const navigationData = {
    id: 'uoms-navigation',
    label: "Units of Mesurements",
    view: "uoms",
    group: "reference-data",
    orderNumber: 100,
    link: "/services/web/codbex-uoms/gen/codbex-uoms/ui/UnitsOfMeasures/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }