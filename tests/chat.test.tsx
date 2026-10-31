import { it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatPanel } from '../components/chat-panel';
import { createMockGenerator } from '../lib/generators/mock';
it('sends, progressively renders an answer and displays sources', async () => {
  render(<ChatPanel generator={createMockGenerator(1)} />);
  fireEvent.click(screen.getByRole('button', { name: /How long does shipping/ }));
  await waitFor(() => expect(screen.getByTestId('answer')).toHaveTextContent('According'));
  expect(screen.getByRole('button', { name: /Answering/ })).toBeDisabled();
  await waitFor(() => expect(screen.getByText('ship-01')).toBeInTheDocument(), { timeout: 3000 });
  expect(screen.getByTestId('answer')).toHaveTextContent('within two working days');
});
it('limits input and reports generator failure', async () => {
  render(
    <ChatPanel
      generator={{
        generate: () => ({
          [Symbol.asyncIterator]: () => ({
            next: async () => {
              throw Error('private detail');
            },
          }),
        }),
      }}
    />,
  );
  const field = screen.getByLabelText('Your question');
  expect(field).toHaveAttribute('maxlength', '500');
  fireEvent.change(field, { target: { value: 'shipping' } });
  expect(screen.getByText('8/500')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /Send question/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to answer');
  expect(screen.getByRole('alert')).not.toHaveTextContent('private detail');
});

it('offers two clarification buttons and asks the selected question', async () => {
  render(<ChatPanel generator={createMockGenerator(0)} />);
  fireEvent.change(screen.getByLabelText('Your question'), {
    target: { value: 'Tell me about delivery' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Send question/ }));
  expect(await screen.findByText('Did you mean…')).toBeVisible();
  const region = screen.getByLabelText('Clarify your question');
  const buttons = region.querySelectorAll('button');
  expect(buttons).toHaveLength(2);
  const title = buttons[0].textContent!;
  await waitFor(() => expect(buttons[0]).toBeEnabled());
  fireEvent.click(buttons[0]);
  await waitFor(() =>
    expect(screen.getAllByTestId('answer').at(-1)).toHaveTextContent('According to our'),
  );
  expect(screen.getByText(title, { selector: '.question p' })).toBeVisible();
  expect(screen.getAllByTestId('answer')[0]).not.toHaveTextContent('not covered');
});
