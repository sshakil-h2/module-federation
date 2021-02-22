type Scope = unknown;
type Factory = () => any;

type Container = {
    init(shareScope: Scope): void;
    get(module: string): Factory;
};

declare const __webpack_init_sharing__: (shareScope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: Scope };


let isDefaultScopeInitialized = false

async function lookupExposedModule<T>(remoteName: string, exposedModule: string): Promise<T> {
  const container = window[remoteName]
  const factory = await container.get(exposedModule)
  const Module = factory()
  return Module as T
}

async function initRemote(remoteName: string) {
  const container = window[remoteName]

  // Do we still need to initialize the remote?
  if (document.getElementById('E_' + remoteName)?.getAttribute('loaded') == 'true') {
    return container
  }

  // Do we still need to initialize the share scope?
  if (!isDefaultScopeInitialized) {
    await __webpack_init_sharing__('default')
    isDefaultScopeInitialized = true
  }

  await container.init(__webpack_share_scopes__.default)
  //remoteMap[remoteName] = true
  return container
}

export type LoadRemoteModuleOptions = {
  remoteEntry?: string
  remoteName: string
  exposedModule: string
}

export function loadRemoteEntry(remoteEntry: string, remoteName: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Is remoteEntry already loaded?
    if (document.getElementById('E_' + remoteName)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.id = 'E_' + remoteName
    script.src = remoteEntry + 'remoteEntry.js'

    script.onerror = reject

    script.onload = () => {
      initRemote(remoteName)
      var typ = document.createAttribute('loaded')
      typ.value = 'true'
      script.attributes.setNamedItem(typ)
      resolve()
    }

    document.body.append(script)
  })
}

export async function loadRemoteModule<T = any>(options: LoadRemoteModuleOptions): Promise<T> {
  if (options.remoteEntry) {
    await loadRemoteEntry(options.remoteEntry, options.remoteName)
  }
  return await lookupExposedModule<T>(options.remoteName, options.exposedModule)
}
