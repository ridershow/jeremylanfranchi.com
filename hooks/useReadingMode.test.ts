import { act, renderHook } from "@testing-library/react";
import { useReadingMode } from "./useReadingMode";

test("opens on the first tap and closes on the second", () => {
  const { result } = renderHook(() =>
    useReadingMode({ phone: true, playing: false }),
  );

  act(() => {
    result.current.toggleReading();
  });
  expect(result.current.reading).toBe(true);

  act(() => {
    result.current.toggleReading();
  });
  expect(result.current.reading).toBe(false);
});

test("pauses playback when the story opens", () => {
  const onOpen = vi.fn();
  const { result } = renderHook(() =>
    useReadingMode({ phone: true, playing: false, onOpen }),
  );

  act(() => {
    result.current.toggleReading();
  });
  expect(onOpen).toHaveBeenCalledOnce();

  act(() => {
    result.current.toggleReading();
  });
  expect(onOpen).toHaveBeenCalledOnce();
});

test("Escape closes the open story", () => {
  const { result } = renderHook(() =>
    useReadingMode({ phone: true, playing: false }),
  );

  act(() => {
    result.current.toggleReading();
  });
  expect(result.current.reading).toBe(true);

  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  });
  expect(result.current.reading).toBe(false);
});

test("closes when playback starts so play and read cannot stack", () => {
  const { result, rerender } = renderHook(
    ({ playing }) => useReadingMode({ phone: true, playing }),
    { initialProps: { playing: false } },
  );

  act(() => {
    result.current.toggleReading();
  });
  expect(result.current.reading).toBe(true);

  rerender({ playing: true });
  expect(result.current.reading).toBe(false);
});
