export type Params = Record<string, any>;

export type Message = {
  senderId: string;
  type: string;
  params: Params;
};

export type DomParams = Params & {
  selector: string; // To find the dom element
  inputValue: string; // Needed for input, textarea, contenteditable
  pointer: { x: number; y: number }; // Needed for pointer and mouse events
  scroll: { x: number; y: number }; // Needed for syncing scroll
};

export type DomMessage = Message & {
  type: string;
  params: DomParams;
};

/*
// Subtype of Message for "Refresh" events
export type RefreshMessage = Message & {
  type: "css-tmp" | "html-tmp"; // You can specify the types of events
  params: { file: string }; // params only contains a "file" property
};
*/
