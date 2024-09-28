const buttonMap: Record<number, MouseEventName> = {
  0: "leftDown",
  1: "middleDown",
  2: "rightDown",
  3: "release",
};

export type MouseEventName =
  | "leftDown"
  | "middleDown"
  | "rightDown"
  | "release"
  | "scrollUp"
  | "scrollDown";

export interface MouseEvent {
  event: MouseEventName;
  control: boolean;
  alt: boolean;
  position: {
    x: number;
    y: number;
  };
}

export function parseMouseEvent(data: Uint8Array): MouseEvent {
  const x = data[1] - 32;
  const y = data[2] - 32;
  const first = data[0];
  const button = first & 3;
  const control = ((first >> 4) & 1) === 1;
  const alt = ((first >> 3) & 1) === 1;
  const scroll = (first >> 6) === 1;
  let event: MouseEventName = buttonMap[button];
  let scrollDirection = 0;
  if (scroll) {
    if (button === 1) {
      scrollDirection = -1;
    }
    if (button === 2) {
      scrollDirection = 1;
    }
    event = scrollDirection === -1 ? "scrollUp" : "scrollDown";
  }

  const mouseEvent: MouseEvent = {
    event,
    control,
    alt,
    position: {
      x,
      y,
    },
  };
  return mouseEvent;
}

export function isMouseEvent(data: Uint8Array): boolean {
  return data.length === 6 && data[0] === 27 && data[1] === 91 &&
    data[2] === 77;
}
