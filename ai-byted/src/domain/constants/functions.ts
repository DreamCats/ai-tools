export interface PresetFunction {
    title: string;
    description: string;
    showRegions?: boolean;
}

export const PRESET_FUNCTIONS: PresetFunction[] = [
    { title: 'argos', description: 'Argos 系统', showRegions: true },
    { title: 'tce', description: 'TCE 容器引擎', showRegions: true },
    { title: 'tcc', description: 'TCC 集群管理', showRegions: true },
    { title: 'nepture', description: 'Nepture 平台', showRegions: true },
    { title: 'api', description: 'API 管理' },
    { title: 'scm', description: 'SCM 源码管理' },
    { title: 'faas', description: 'FaaS 函数服务', showRegions: true }
]; 