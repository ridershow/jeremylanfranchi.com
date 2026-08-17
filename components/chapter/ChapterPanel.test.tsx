import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Chapter } from "@/lib/types";
import { ChapterPanel } from "./ChapterPanel";
import { CLOSE_LABEL, READ_MORE_LABEL } from "./ReadToggle";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const chapter: Chapter = {
  slug: "bali",
  title: "Bali",
  kind: "travel",
  start: "2018-01-01",
  end: "2018-06-01",
  kicker: "Bootcamp",
  location: { name: "Canggu, Indonesia", lat: -8.65, lng: 115.13 },
  moments: [],
  photos: [],
  body: "First paragraph of the stay.\n\nSecond paragraph that only the full story should show.",
};

function Panel() {
  const [reading, setReading] = useState(false);
  return (
    <ChapterPanel
      chapters={[chapter]}
      chapter={chapter}
      activeIndex={0}
      reducedMotion
      collapsed={false}
      playing={false}
      reading={reading}
      onGoTo={() => {}}
      onPrev={() => {}}
      onNext={() => {}}
      onTogglePlay={() => {}}
      onStart={() => {}}
      onEnd={() => {}}
      onToggleReading={() => setReading((open) => !open)}
    />
  );
}

test("read more opens the story and close returns to the teaser", async () => {
  const user = userEvent.setup();
  render(<Panel />);

  await user.click(screen.getByRole("button", { name: READ_MORE_LABEL }));
  expect(screen.getByRole("button", { name: CLOSE_LABEL })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: READ_MORE_LABEL }),
  ).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: CLOSE_LABEL }));
  expect(
    screen.getByRole("button", { name: READ_MORE_LABEL }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: CLOSE_LABEL }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/lire plus|fermer/i)).not.toBeInTheDocument();
});
