export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type TransportType = "Ferry" | "Speedboat" | "Flight";

export interface RouteResult {
  id: number;
  originName: string;
  destinationName: string;
  duration: number;
  price: number;
  transportType: TransportType;
}

export interface ScheduleLeg {
  origin: string;
  destination: string;
  departureTime: string;
  departureMeridiem: "AM" | "PM";
  arrivalTime: string;
  arrivalMeridiem: "AM" | "PM";
  selectedRouteId: number | null;

  price: number;
  routeResults: RouteResult[];
}

export interface Step2DataState {
  scheduleCode: string;
  searchRoutes: string;

  origin: string;
  destination: string;
  departureTime: string;
  departureMeridiem: "AM" | "PM";
  arrivalTime: string;
  arrivalMeridiem: "AM" | "PM";
  maxPassengers: string;
  selectedRouteId: number | null;

  legs: ScheduleLeg[];

  allTheTime: boolean;
  selectedDays: number[];
  availability: DateRange;

  localAdult: string;
  localChild: string;
  localInfant: string;
  expatAdult: string;
  expatChild: string;
  expatInfant: string;
  touristAdult: string;
  touristChild: string;
  touristInfant: string;

  segmentPrices?: Record<
    string,
    Partial<
      Record<
        | "localAdult"
        | "localChild"
        | "localInfant"
        | "expatAdult"
        | "expatChild"
        | "expatInfant"
        | "touristAdult"
        | "touristChild"
        | "touristInfant",
        number
      >
    >
  >;

  pathPrices?: Record<string, number>;
}

export interface AddScheduleDialogProps {
  locationOptions: string[];
}

export interface Step1ScheduleTypeProps {
  scheduleType: "single" | "multi-hop" | null;
  onTypeSelect: (t: "single" | "multi-hop") => void;
}

export interface Step2SingleDialogProps {
  data: Step2DataState;
  setData: React.Dispatch<React.SetStateAction<Step2DataState>>;
  locationOptions: string[];
}

export interface Step2ScheduleDetailsProps {
  data: Step2DataState;
  setData: React.Dispatch<React.SetStateAction<Step2DataState>>;
  locationOptions: string[];
}

export interface Step3ReviewScheduleProps {
  scheduleType: "single";
  data: Step2DataState;
  setData: React.Dispatch<React.SetStateAction<Step2DataState>>;
}

export interface Step3MultiLegScheduleProps {
  data: Step2DataState;
  setData: React.Dispatch<React.SetStateAction<Step2DataState>>;
}

export interface FinalizeScheduleDialogProps {
  scheduleType: "single" | "multi-hop" | null;
  data: Step2DataState;
  onFinalize: () => void | Promise<void>;
  onBack: () => void;
  setData: React.Dispatch<React.SetStateAction<Step2DataState>>;
}

export interface RouteResult {
  id: number;
  originName: string;
  destinationName: string;
  duration: number;
  price: number;
  origin: string;
  destination: string;
  transportType: "Ferry" | "Speedboat" | "Flight";
}

export interface ScheduleLeg {
  origin: string;
  destination: string;
  departureTime: string;
  departureMeridiem: "AM" | "PM";
  arrivalTime: string;
  arrivalMeridiem: "AM" | "PM";
  selectedRouteId: number | null;
  price: number;
  routeResults: RouteResult[];
}

export interface Step2ScheduleDetailsProps {
  data: Step2DataState;
  setData: React.Dispatch<React.SetStateAction<Step2DataState>>;
  locationOptions: string[];
}
