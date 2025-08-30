export function formatNameWithNickname(firstName: string, lastName: string, nickname: string): string {
  const formats = [
    // Original format
    `${firstName} "${nickname}" ${lastName}`,
    // Parentheses format
    `${firstName} (${nickname}) ${lastName}`,
    // AKA format
    `${firstName} ${lastName}, AKA ${nickname}`,
    // Nickname first format
    `${nickname} (${firstName} ${lastName})`
  ]
  
  // Use a simple hash of the name to ensure consistent formatting for the same person
  const nameHash = (firstName + lastName + nickname).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const formatIndex = Math.abs(nameHash) % formats.length
  return formats[formatIndex]
}
