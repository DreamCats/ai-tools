"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaLabels = exports.RegionsByArea = exports.Area = void 0;
var Area;
(function (Area) {
    Area["CN"] = "cn";
    Area["US_TTP"] = "ttp-us";
    Area["EU_TTP"] = "ttp-eu";
    Area["I18"] = "i18n";
})(Area = exports.Area || (exports.Area = {}));
exports.RegionsByArea = {
    [Area.CN]: ["China-East", "China-North", "China-PPE"],
    [Area.US_TTP]: ["US-TTP", "US-TTP-PPE", "US-TTP2"],
    [Area.EU_TTP]: ["EU-TTP", "EU-TTP-PPE", "EU-TTP2"],
    [Area.I18]: ["Singapore-Central", "US-East", "Singapore-PPE"]
};
exports.AreaLabels = {
    [Area.CN]: "中国",
    [Area.US_TTP]: "美国",
    [Area.EU_TTP]: "欧洲",
    [Area.I18]: "国际"
};
