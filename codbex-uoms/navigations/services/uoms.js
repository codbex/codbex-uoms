const navigationData = {
    id: 'uoms-navigation',
    label: "Units of Mesurements",
    view: "uoms",
    group: "configurations",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-uoms/gen/codbex-uoms/ui/UnitsOfMeasures/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }