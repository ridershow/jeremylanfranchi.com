import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CLOSE_LABEL, READ_MORE_LABEL, ReadToggle } from "./ReadToggle";

test("uses English labels matching the rest of the site", () => {
  const { rerender } = render(<ReadToggle expanded={false} onClick={() => {}} />);
  expect(screen.getByRole("button", { name: READ_MORE_LABEL })).toBeInTheDocument();
  expect(screen.queryByText(/lire plus|fermer/i)).not.toBeInTheDocument();

  rerender(<ReadToggle expanded onClick={() => {}} />);
  expect(screen.getByRole("button", { name: CLOSE_LABEL })).toBeInTheDocument();
  expect(screen.queryByText(/lire plus|fermer/i)).not.toBeInTheDocument();
});

test("close calls the same handler as read more", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  const { rerender } = render(
    <ReadToggle expanded={false} onClick={onClick} />,
  );

  await user.click(screen.getByRole("button", { name: READ_MORE_LABEL }));
  rerender(<ReadToggle expanded onClick={onClick} />);
  await user.click(screen.getByRole("button", { name: CLOSE_LABEL }));

  expect(onClick).toHaveBeenCalledTimes(2);
});
