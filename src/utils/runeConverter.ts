interface RuneMapping {
  latin: string
  rune: string
  name: string
}

const runeMap: RuneMapping[] = [
  { latin: 'f', rune: 'ᚠ', name: 'Fehu' },
  { latin: 'u', rune: 'ᚢ', name: 'Uruz' },
  { latin: 'ū', rune: 'ᚢ', name: 'Uruz' },
  { latin: 'ų', rune: 'ᚢ', name: 'Uruz' },
  { latin: 'th', rune: 'ᚦ', name: 'Thurisaz' },
  { latin: 'a', rune: 'ᚨ', name: 'Ansuz' },
  { latin: 'ą', rune: 'ᚨ', name: 'Ansuz' },
  { latin: 'r', rune: 'ᚱ', name: 'Raidho' },
  { latin: 'k', rune: 'ᚲ', name: 'Kenaz' },
  { latin: 'c', rune: 'ᚲ', name: 'Kenaz' },
  { latin: 'č', rune: 'ᚲ', name: 'Kenaz' },
  { latin: 'g', rune: 'ᚷ', name: 'Gebo' },
  { latin: 'w', rune: 'ᚹ', name: 'Wunjo' },
  { latin: 'v', rune: 'ᚹ', name: 'Wunjo' },
  { latin: 'h', rune: 'ᚺ', name: 'Hagalaz' },
  { latin: 'n', rune: 'ᚾ', name: 'Nauthiz' },
  { latin: 'i', rune: 'ᛁ', name: 'Isa' },
  { latin: 'į', rune: 'ᛁ', name: 'Isa' },
  { latin: 'y', rune: 'ᛁ', name: 'Isa' },
  { latin: 'j', rune: 'ᛃ', name: 'Jera' },
  { latin: 'ei', rune: 'ᛇ', name: 'Eihwaz' },
  { latin: 'p', rune: 'ᛈ', name: 'Perthro' },
  { latin: 'z', rune: 'ᛉ', name: 'Algiz' },
  { latin: 'ž', rune: 'ᛉ', name: 'Algiz' },
  { latin: 's', rune: 'ᛊ', name: 'Sowilo' },
  { latin: 'š', rune: 'ᛊ', name: 'Sowilo' },
  { latin: 't', rune: 'ᛏ', name: 'Tiwaz' },
  { latin: 'b', rune: 'ᛒ', name: 'Berkano' },
  { latin: 'e', rune: 'ᛖ', name: 'Ehwaz' },
  { latin: 'ė', rune: 'ᛖ', name: 'Ehwaz' },
  { latin: 'ę', rune: 'ᛖ', name: 'Ehwaz' },
  { latin: 'm', rune: 'ᛗ', name: 'Mannaz' },
  { latin: 'l', rune: 'ᛚ', name: 'Laguz' },
  { latin: 'ng', rune: 'ᛜ', name: 'Ingwaz' },
  { latin: 'd', rune: 'ᛞ', name: 'Dagaz' },
  { latin: 'o', rune: 'ᛟ', name: 'Othala' },
]

export interface ConvertedRune {
  original: string
  rune: string
  name: string
}

export function textToRunes(text: string): ConvertedRune[] {
  const result: ConvertedRune[] = []
  const lowerText = text.toLowerCase()
  let i = 0

  while (i < lowerText.length) {
    let matched = false

    // Try to match digraphs first (th, ei, ng)
    if (i + 1 < lowerText.length) {
      const digraph = lowerText.slice(i, i + 2)
      const digraphMapping = runeMap.find(m => m.latin === digraph)
      if (digraphMapping) {
        result.push({
          original: text.slice(i, i + 2),
          rune: digraphMapping.rune,
          name: digraphMapping.name,
        })
        i += 2
        matched = true
      }
    }

    if (!matched) {
      const char = lowerText[i]
      const mapping = runeMap.find(m => m.latin === char)
      
      if (mapping) {
        result.push({
          original: text[i],
          rune: mapping.rune,
          name: mapping.name,
        })
      } else if (char === ' ') {
        result.push({
          original: ' ',
          rune: ' ',
          name: 'Space',
        })
      } else if (/[a-ząčęėįšųūž]/i.test(char)) {
        result.push({
          original: text[i],
          rune: '?',
          name: 'Unknown',
        })
      }
      i++
    }
  }

  return result
}

export function getRuneString(converted: ConvertedRune[]): string {
  return converted.map(c => c.rune).join('')
}

export function getUniqueRunes(converted: ConvertedRune[]): ConvertedRune[] {
  const seen = new Set<string>()
  return converted.filter(c => {
    if (c.rune === ' ' || c.rune === '?' || seen.has(c.rune)) return false
    seen.add(c.rune)
    return true
  })
}
