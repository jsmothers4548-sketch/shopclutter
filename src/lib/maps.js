// Build a maps link that opens the device's map app with the address as the
// destination, so turn-by-turn routing starts without retyping anything.
export const directionsUrl = (address) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    (address || '').trim()
  )}`;