import { describe, expect, it } from 'vitest'
import { amountToPaise, formatInrFromPaise, rupeesTextToPaise } from './money'

describe('money formatting utilities', () => {
  it('rupeesTextToPaise converts valid rupee strings to paise', () => {
    expect(rupeesTextToPaise('100')).toBe(10000)
    expect(rupeesTextToPaise('100.50')).toBe(10050)
    expect(rupeesTextToPaise('100.5')).toBe(10050)
    expect(rupeesTextToPaise('0')).toBe(0)
  })

  it('rupeesTextToPaise returns null for invalid strings', () => {
    expect(rupeesTextToPaise('-100')).toBeNull() // negative values
    expect(rupeesTextToPaise('abc')).toBeNull()
    expect(rupeesTextToPaise('100.505')).toBeNull() // too many decimals
  })

  it('amountToPaise converts numeric amounts or valid strings to paise integer', () => {
    expect(amountToPaise(100)).toBe(10000)
    expect(amountToPaise('100.00')).toBe(10000)
  })

  it('formatInrFromPaise properly formats paise values into INR strings', () => {
    expect(formatInrFromPaise(10000)).toMatch(/100\.00/)
    expect(formatInrFromPaise(10050)).toMatch(/100\.50/)
    expect(formatInrFromPaise(0)).toMatch(/0\.00/)
    // test indian number separators
    expect(formatInrFromPaise(10000000)).toMatch(/1,00,000\.00/) // 1 lakh
  })
})
