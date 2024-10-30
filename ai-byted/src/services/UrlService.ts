import { Area } from '../domain/constants/area';
import { GetScmName } from '../utils/psmUtils';

export interface UrlConfig {
    baseUrl: string;
    requiresArea?: boolean;
    requiresRegion?: boolean;
    requiresPsm?: boolean;
    requiresLogId?: boolean;
    psmTransform?: (psm: string) => string;
}

export const FunctionUrls: Record<string, UrlConfig> = {
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
        psmTransform: GetScmName
    },
    'api': {
        baseUrl: "https://cloud-{area}.bytedance.net/bam/rd/{psm}",
        requiresArea: true,
        requiresRegion: false,
        requiresPsm: true
    },
    'logid': {
        baseUrl: "https://cloud-{area}.bytedance.net/argos/streamlog/info_overview/log_id_search?region={region}&logId={logId}",
        requiresArea: true,
        requiresRegion: true,
        requiresLogId: true
    },
};

export class UrlService {
    static buildUrl(functionName: string, params: {
        area?: string;
        region?: string;
        psm?: string;
        logId?: string;
    }): string | null {
        console.log('Building URL for:', { functionName, params });

        const config = FunctionUrls[functionName.toLowerCase()];
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
        if (config.requiresLogId && !params.logId) {
            console.log('Missing required logId parameter');
            return null;
        }

        if (params.area) {
            url = params.area.toLowerCase() === 'cn' 
                ? url.replace('-{area}', '') 
                : url.replace('{area}', params.area);
        }
        
        if (params.region) url = url.replace('{region}', params.region);
        
        if (params.psm) {
            const transformedPsm = config.psmTransform 
                ? config.psmTransform(params.psm) 
                : params.psm;
            url = url.replace('{psm}', transformedPsm);
        }

        if (params.logId) {
            url = url.replace('{logId}', params.logId);
        }

        console.log('Generated URL:', url);
        return url;
    }
} 