export enum Area {
    CN = "cn",
    US_TTP = "ttp-us",
    EU_TTP = "ttp-eu",
    I18 = "i18n"
}

export const RegionsByArea: Record<Area, string[]> = {
    [Area.CN]: ["China-East", "China-North", "China-PPE"],
    [Area.US_TTP]: ["US-TTP", "US-TTP-PPE", "US-TTP2"],
    [Area.EU_TTP]: ["EU-TTP", "EU-TTP-PPE", "EU-TTP2"],
    [Area.I18]: ["Singapore-Central", "US-East", "Singapore-PPE"]
};

export const AreaLabels: Record<Area, string> = {
    [Area.CN]: "中国",
    [Area.US_TTP]: "美国",
    [Area.EU_TTP]: "欧洲",
    [Area.I18]: "国际"
};

export const RegionLabels: Record<string, string> = {
    "China-East": "China-East",
    "China-North": "China-North",
    "China-PPE": "China-PPE",
    "US-TTP": "US-TTP",
    "US-TTP-PPE": "US-TTP PPE",
    "US-TTP2": "US-TTP2",
    "EU-TTP": "EU-TTP",
    "EU-TTP-PPE": "EU-TTP PPE",
    "EU-TTP2": "EU-TTP2",
    "Singapore-Central": "Singapore-Central",
    "US-East": "US-East",
    "Singapore-PPE": "Singapore-PPE"
}; 