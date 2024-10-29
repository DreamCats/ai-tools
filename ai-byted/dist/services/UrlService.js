"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlService = exports.FunctionUrls = void 0;
const psmUtils_1 = require("../utils/psmUtils");
exports.FunctionUrls = {
    'argos': {
        baseUrl: "https://cloud-{area}.bytedance.net/argos/overview/server_overview?from=now-1h&region={region}&psm={psm}",
        requiresArea: true,
        requiresRegion: true,
        requiresPsm: true
    },
    'tce': {
        baseUrl: "https://cloud-{area}.bytedance.net/tce/services?&page=1&subs_prefer=true&type=all&keyword={psm}",
        requiresArea: true,
        requiresRegion: false,
        requiresPsm: true
    },
    'tcc': {
        baseUrl: "https://cloud-{area}.bytedance.net/tcc/search?q={psm}",
        requiresArea: true,
        requiresRegion: false,
        requiresPsm: true
    },
    'nepture': {
        baseUrl: "https://cloud-{area}.bytedance.net/neptune/interfaceTest?_env=prod&_zone={region}&_psm={psm}",
        requiresArea: true,
        requiresRegion: true,
        requiresPsm: true
    },
    'faas': {
        baseUrl: "https://cloud-{area}.bytedance.net/faas/?page=1&type=all&search={psm}",
        requiresArea: true,
        requiresRegion: false,
        requiresPsm: true
    },
    'scm': {
        baseUrl: "https://cloud-{area}.bytedance.net/scm/all?page=1&language=&page_size=10&search={psm}",
        requiresArea: true,
        requiresRegion: false,
        requiresPsm: true,
        psmTransform: psmUtils_1.GetScmName
    },
    'api': {
        baseUrl: "https://cloud-{area}.bytedance.net/bam/rd/{psm}",
        requiresArea: true,
        requiresRegion: false,
        requiresPsm: true
    },
};
class UrlService {
    static buildUrl(functionName, params) {
        console.log('Building URL for:', { functionName, params });
        const config = exports.FunctionUrls[functionName.toLowerCase()];
        if (!config) {
            console.log('No URL config found for:', functionName);
            return null;
        }
        let url = config.baseUrl;
        if (config.requiresArea && !params.area) {
            console.log('Missing required area parameter');
            return null;
        }
        if (config.requiresRegion && !params.region) {
            console.log('Missing required region parameter');
            return null;
        }
        if (config.requiresPsm && !params.psm) {
            console.log('Missing required psm parameter');
            return null;
        }
        if (params.area) {
            url = params.area.toLowerCase() === 'cn'
                ? url.replace('-{area}', '')
                : url.replace('{area}', params.area);
        }
        if (params.region)
            url = url.replace('{region}', params.region);
        if (params.psm) {
            const transformedPsm = config.psmTransform
                ? config.psmTransform(params.psm)
                : params.psm;
            url = url.replace('{psm}', transformedPsm);
        }
        console.log('Generated URL:', url);
        return url;
    }
}
exports.UrlService = UrlService;
