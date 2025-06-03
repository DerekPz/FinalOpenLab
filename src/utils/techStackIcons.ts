export function getTechIconUrl(techName: string): string {
  const normalizedName = techName.toLowerCase();
  const iconId = techIconsMap[techName] || 
                techIconsMap[Object.keys(techIconsMap).find(key => 
                  key.toLowerCase() === normalizedName
                ) || ''] || 
                '/assets/default.png'; // Fallback a la imagen por defecto en assets

  return iconId.startsWith('/') ? iconId : `https://cdn.simpleicons.org/${iconId}`;
}