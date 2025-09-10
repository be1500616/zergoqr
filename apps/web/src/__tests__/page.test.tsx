import { render, screen } from '@testing-library/react'
import HomePage from '../app/page'

describe('HomePage', () => {
  it('renders the welcome heading', () => {
    render(<HomePage />)
    
    const heading = screen.getByRole('heading', { name: /welcome to zergo qr/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<HomePage />)
    
    const description = screen.getByText(/restaurant qr code ordering system/i)
    expect(description).toBeInTheDocument()
  })

  it('renders the setup completion message', () => {
    render(<HomePage />)
    
    const setupMessage = screen.getByText(/monorepo setup complete/i)
    expect(setupMessage).toBeInTheDocument()
  })

  it('has the correct structure', () => {
    render(<HomePage />)
    
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('flex', 'min-h-screen', 'flex-col', 'items-center', 'justify-center')
  })
})
