interface PresetFunction {
    title: string;
    description: string;
}

export const PRESET_FUNCTIONS: PresetFunction[] = [
    { title: 'argos', description: 'Argos 系统' },
    { title: 'tce', description: 'TCE 容器引擎' },
    { title: 'tcc', description: 'TCC 集群管理' },
    { title: 'nepture', description: 'Nepture 平台' },
    { title: 'api', description: 'API 管理' },
    { title: 'scm', description: 'SCM 源码管理' },
    { title: 'faas', description: 'FaaS 函数服务' }
]; 