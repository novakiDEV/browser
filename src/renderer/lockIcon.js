export function initLockIcon() {
  const lockButton = document.getElementById('lock-button')
  if (!lockButton) return

  const secureIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 508.779 508.779" width="14" height="14">
      <g>
        <path d="M403.723,180.395v-31.061C403.723,66.859,336.864,0,254.389,0S105.056,66.859,105.056,149.333v31.061   c-39.236,20.023-63.952,60.334-64,104.384v106.667c0.071,64.772,52.561,117.263,117.333,117.333h192   c64.772-0.071,117.263-52.561,117.333-117.333V284.779C467.675,240.729,442.959,200.417,403.723,180.395z M254.389,64   c47.128,0,85.333,38.205,85.333,85.333v18.112H169.056v-18.112C169.056,102.205,207.261,64,254.389,64z M403.723,391.445   c0,29.455-23.878,53.333-53.333,53.333h-192c-29.455,0-53.333-23.878-53.333-53.333V284.779c0-29.455,23.878-53.333,53.333-53.333   h192c29.455,0,53.333,23.878,53.333,53.333V391.445z"/>
        <path d="M243.723,295.445h21.333c17.673,0,32,14.327,32,32l0,0c0,17.673-14.327,32-32,32h-21.333c-17.673,0-32-14.327-32-32l0,0   C211.723,309.772,226.05,295.445,243.723,295.445z"/>
      </g>
    </svg>
  `

  const insecureIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.033 512.033" width="14" height="14">
      <g>
        <path d="M352.017,170.7H170.683v-16.491c0.009-49.815,40.399-90.19,90.214-90.181c32.799,0.006,63.01,17.816,78.895,46.511   c8.577,15.452,28.057,21.025,43.509,12.448s21.025-28.057,12.448-43.509l0,0C354.469,4.992,260.62-21.925,186.134,19.356   c-49.024,27.17-79.445,78.803-79.451,134.853v29.44c-39.236,20.023-63.952,60.334-64,104.384V394.7   c0.071,64.772,52.561,117.263,117.333,117.333h192c64.772-0.071,117.263-52.561,117.333-117.333V288.033   C469.28,223.261,416.789,170.771,352.017,170.7z M405.35,394.7c0,29.455-23.878,53.333-53.333,53.333h-192   c-29.455,0-53.333-23.878-53.333-53.333V288.033c0-29.455,23.878-53.333,53.333-53.333h192c29.455,0,53.333,23.878,53.333,53.333   V394.7z"/>
        <path d="M245.35,298.7h21.333c17.673,0,32,14.327,32,32l0,0c0,17.673-14.327,32-32,32H245.35c-17.673,0-32-14.327-32-32l0,0   C213.35,313.027,227.677,298.7,245.35,298.7z"/>
      </g>
    </svg>
  `

  const updateLockIcon = (url) => {
    if (!url) return

    const isSecure = url.startsWith('https://')
    
    if (isSecure) {
      lockButton.innerHTML = secureIcon
      lockButton.classList.remove('insecure')
      lockButton.title = 'Secure Connection'
    } else if (url.startsWith('http://')) {
      lockButton.innerHTML = insecureIcon
      lockButton.classList.add('insecure')
      lockButton.title = 'Not Secure'
    } else {
      // For other protocols (about:, file:, etc.), hide or show neutral state
      lockButton.innerHTML = secureIcon
      lockButton.classList.remove('insecure')
      lockButton.title = 'Certificate Information'
    }
  }

  return { updateLockIcon }
}
