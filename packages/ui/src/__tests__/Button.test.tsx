import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../components/Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies default variant and size classes', () => {
    render(<Button>Default Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600', 'text-white', 'h-10', 'px-4', 'py-2')
  })

  it('applies custom variant classes', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-200', 'text-gray-900')
  })

  it('applies custom size classes', () => {
    render(<Button size="lg">Large Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-12', 'px-6', 'text-lg')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clickable Button</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none')
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})
