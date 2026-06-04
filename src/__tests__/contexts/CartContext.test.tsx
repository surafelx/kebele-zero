import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../../contexts/CartContext';

// Helper component that exposes cart operations via data attributes
function CartTestConsumer() {
  const { cart, addToCart, removeFromCart, clearCart, cartTotal } = useCart();

  const product = (id: string, price = 10) => ({
    _id: id,
    name: `Product ${id}`,
    price,
    images: [],
    category: 'test',
    inventory: { quantity: 5 },
    isActive: true,
    isFeatured: false,
  });

  return (
    <div>
      <span data-testid="count">{cart.length}</span>
      <span data-testid="total">{cartTotal}</span>
      <span data-testid="items">{JSON.stringify(cart.map(i => ({ id: i.product._id, qty: i.quantity })))}</span>
      <button onClick={() => addToCart(product('p1', 10))} data-testid="add-p1">add p1</button>
      <button onClick={() => addToCart(product('p2', 25))} data-testid="add-p2">add p2</button>
      <button onClick={() => removeFromCart('p1')} data-testid="remove-p1">remove p1</button>
      <button onClick={() => clearCart()} data-testid="clear">clear</button>
    </div>
  );
}

function renderCart() {
  return render(
    <CartProvider>
      <CartTestConsumer />
    </CartProvider>
  );
}

describe('CartContext', () => {
  it('starts with an empty cart', () => {
    renderCart();
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
  });

  it('adds a new item to the cart', async () => {
    renderCart();
    await userEvent.click(screen.getByTestId('add-p1'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('increments quantity when adding the same product twice', async () => {
    renderCart();
    await userEvent.click(screen.getByTestId('add-p1'));
    await userEvent.click(screen.getByTestId('add-p1'));
    const items = JSON.parse(screen.getByTestId('items').textContent!);
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(2);
  });

  it('adds different products as separate cart entries', async () => {
    renderCart();
    await userEvent.click(screen.getByTestId('add-p1'));
    await userEvent.click(screen.getByTestId('add-p2'));
    expect(screen.getByTestId('count').textContent).toBe('2');
  });

  it('removes an item from the cart', async () => {
    renderCart();
    await userEvent.click(screen.getByTestId('add-p1'));
    await userEvent.click(screen.getByTestId('remove-p1'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('does not remove items that were not added', async () => {
    renderCart();
    await userEvent.click(screen.getByTestId('add-p2'));
    await userEvent.click(screen.getByTestId('remove-p1')); // p1 not in cart
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('clears all items from the cart', async () => {
    renderCart();
    await userEvent.click(screen.getByTestId('add-p1'));
    await userEvent.click(screen.getByTestId('add-p2'));
    await userEvent.click(screen.getByTestId('clear'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('computes cartTotal as sum of price × quantity', async () => {
    renderCart();
    await userEvent.click(screen.getByTestId('add-p1')); // 10
    await userEvent.click(screen.getByTestId('add-p1')); // 10 again → qty 2
    await userEvent.click(screen.getByTestId('add-p2')); // 25
    // total = 10*2 + 25*1 = 45
    expect(screen.getByTestId('total').textContent).toBe('45');
  });

  it('cartTotal returns 0 after clearCart', async () => {
    renderCart();
    await userEvent.click(screen.getByTestId('add-p1'));
    await userEvent.click(screen.getByTestId('clear'));
    expect(screen.getByTestId('total').textContent).toBe('0');
  });

  it('throws when useCart is used outside CartProvider', () => {
    const OriginalError = console.error;
    console.error = jest.fn(); // suppress React error boundary noise
    expect(() => render(<CartTestConsumer />)).toThrow(
      'useCart must be used within CartProvider'
    );
    console.error = OriginalError;
  });
});
