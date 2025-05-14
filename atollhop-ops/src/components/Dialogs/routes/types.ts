export type TransportMethod =
  | "conventional-ferry"
  | "speed-boat"
  | "domestic-flight"
  | "";

export interface AddRouteDialogProps {
  locationOptions: string[];
}

export interface AddRoutePayload {
  transportType: "Ferry" | "Speedboat" | "Flight";
  origin: string;
  destination: string;
  duration: number;
}
