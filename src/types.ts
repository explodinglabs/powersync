export type Params = Record<string, any>;

export type Message = {
  senderId: string;
  type: string;
  params: Params;
};

export type DomParams = Params & {
  selector: string;
  value: string | null;
  scrollY: number;
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
