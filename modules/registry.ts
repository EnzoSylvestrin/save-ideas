import type { HubModule } from './types';
import { ideasModule } from './ideas/module';

/**
 * Única fonte da verdade dos módulos do hub.
 * Adicionar um módulo = importar o descritor e colocá-lo neste array.
 * Home, folha de captura e quick actions se montam a partir daqui.
 */
export const MODULES: HubModule[] = [ideasModule];
