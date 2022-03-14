const postMessage = () => {};
const parent = { postMessage };

export const WindowMock = {
  addEventListener: () => {},
  parent,
  self: parent,
  postMessage,
  location: { origin: 'http://chess-mate.com' },
} as any;
