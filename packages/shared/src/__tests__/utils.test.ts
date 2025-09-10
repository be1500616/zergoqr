import { formatCurrency, cn } from '../utils'

describe('formatCurrency', () => {
  it('formats currency with default INR', () => {
    expect(formatCurrency(1000)).toBe('₹1,000.00')
  })

  it('formats currency with custom currency', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00')
  })

  it('handles decimal values', () => {
    expect(formatCurrency(1234.56)).toBe('₹1,234.56')
  })

  it('handles zero value', () => {
    expect(formatCurrency(0)).toBe('₹0.00')
  })

  it('handles negative values', () => {
    expect(formatCurrency(-500)).toBe('-₹500.00')
  })
})

describe('cn', () => {
  it('joins valid class names', () => {
    expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3')
  })

  it('filters out falsy values', () => {
    expect(cn('class1', null, 'class2', undefined, 'class3', false)).toBe('class1 class2 class3')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('handles all falsy values', () => {
    expect(cn(null, undefined, false, '')).toBe('')
  })

  it('handles single class', () => {
    expect(cn('single-class')).toBe('single-class')
  })
})
