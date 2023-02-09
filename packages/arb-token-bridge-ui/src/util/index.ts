export enum ConnectionState {
  LOADING,
  L1_CONNECTED,
  L2_CONNECTED,
  SEQUENCER_UPDATE,
  NETWORK_ERROR
}

export const sanitizeImageSrc = (url: string): string => {
  if (url.startsWith('ipfs')) {
    return `https://ipfs.io/ipfs/${url.substring(7)}`
  }

  return url
}

export function preloadImages(imageSources: string[]) {
  imageSources.forEach(imageSrc => {
    const image = new Image()
    image.src = imageSrc
  })
}

export const loadEnvironmentVariableWithFallback = ({
  env,
  fallback
}: {
  env?: string
  fallback: string
}) => {
  if (typeof env === 'undefined' || env.trim().length === 0) {
    return fallback
  }
  return env
}
