import type { HubModule } from './types';
import { ideasModule } from './ideas/module';

/**
 * Única fonte da verdade dos módulos do hub.
 * Home, folha de captura e quick actions se montam a partir deste array.
 *
 * Para adicionar um módulo:
 *  1. Crie a tela em app/<modulo>/index.tsx
 *  2. Registre a rota em app/_layout.tsx (<Stack.Screen name="<modulo>/index" />)
 *  3. Crie o descritor em modules/<modulo>/module.ts
 *  4. Importe e adicione o descritor a este array
 */
export const MODULES: HubModule[] = [ideasModule];
