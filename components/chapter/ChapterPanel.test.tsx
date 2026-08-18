import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Chapter } from "@/lib/types";
import { ChapterPanel } from "./ChapterPanel";
import { NEXT_PHOTO_LABEL, PREV_PHOTO_LABEL } from "./PhotoLightbox";
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

const photosChapter: Chapter = {
  ...chapter,
  photos: [
    { src: "/photos/bali/underwater.jpg", caption: "Underwater" },
    { src: "/photos/bali/bootcamp-hotel.jpg", caption: "Bootcamp hotel" },
  ],
};

function PhotosPanel() {
  return (
    <ChapterPanel
      chapters={[photosChapter]}
      chapter={photosChapter}
      activeIndex={0}
      reducedMotion
      collapsed={false}
      playing={false}
      reading={false}
      onGoTo={() => {}}
      onPrev={() => {}}
      onNext={() => {}}
      onTogglePlay={() => {}}
      onStart={() => {}}
      onEnd={() => {}}
    />
  );
}

test("clicking a thumbnail opens the full photo and close returns to the panel", async () => {
  const user = userEvent.setup();
  render(<PhotosPanel />);

  await user.click(screen.getByRole("button", { name: "View Underwater" }));

  const dialog = screen.getByRole("dialog", { name: "Underwater" });
  expect(within(dialog).getByRole("img", { name: "Underwater" })).toBeInTheDocument();

  await user.click(within(dialog).getByRole("button", { name: CLOSE_LABEL }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("next and prev move between photos in the lightbox", async () => {
  const user = userEvent.setup();
  render(<PhotosPanel />);

  await user.click(screen.getByRole("button", { name: "View Underwater" }));

  const dialog = screen.getByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: NEXT_PHOTO_LABEL }));
  expect(screen.getByRole("dialog", { name: "Bootcamp hotel" })).toBeInTheDocument();
  expect(
    within(screen.getByRole("dialog")).getByRole("img", { name: "Bootcamp hotel" }),
  ).toBeInTheDocument();

  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: PREV_PHOTO_LABEL }),
  );
  expect(screen.getByRole("dialog", { name: "Underwater" })).toBeInTheDocument();
});
