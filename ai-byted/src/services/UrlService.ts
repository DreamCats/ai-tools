import { Area } from '../domain/constants/area';

export interface UrlConfig {
    baseUrl: string;
    requiresArea?: boolean;
    requiresRegion?: boolean;
    requiresPsm?: boolean;
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
        baseUrl: "https://cloud-{area}.bytedance.net/tcc/overview?region={region}&psm={psm}",
        requiresArea: true,
        requiresRegion: true,
        requiresPsm: true
    }
};

export class UrlService {
    static buildUrl(functionName: string, params: {
        area?: string;
        region?: string;
        psm?: string;
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

        if (params.area) {
            url = params.area.toLowerCase() === 'cn' 
                ? url.replace('-{area}', '') 
                : url.replace('{area}', params.area);
        }
        
        if (params.region) url = url.replace('{region}', params.region);
        if (params.psm) url = url.replace('{psm}', params.psm);

        console.log('Generated URL:', url);
        return url;
    }
} 