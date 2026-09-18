export type NotFoundDestination = {
  href: string;
  index: string;
  title: string;
  description: string;
  action: string;
};

export type NotFoundCheckState = "ok" | "failed";

export type NotFoundCheck = {
  label: string;
  detail: string;
  state: NotFoundCheckState;
  stateLabel: string;
};
