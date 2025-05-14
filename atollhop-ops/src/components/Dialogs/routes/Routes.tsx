/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReusableDialog } from "@/components/Dialogs/DialogLayout/ReusableDialog";
import { ArrowRight, Plus, ShipWheel, Ship, Plane } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { addRoute } from "@/actions/addRoutes";
import { Combobox, Option } from "../../combo-box";

import type {
  TransportMethod,
  AddRouteDialogProps,
  AddRoutePayload,
} from "./types";

export function AddRouteDialog({ locationOptions }: AddRouteDialogProps) {
  const [open, setOpen] = React.useState(false);

  const [transport, setTransport] = React.useState<TransportMethod>("");
  const [origin, setOrigin] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [hours, setHours] = React.useState("");
  const [minutes, setMinutes] = React.useState("");

  const originOptions: Option[] = locationOptions
    .filter((loc) => loc !== destination)
    .map((loc) => ({ value: loc, label: loc }));

  const destinationOptions: Option[] = locationOptions
    .filter((loc) => loc !== origin)
    .map((loc) => ({ value: loc, label: loc }));

  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit() {
    const totalMinutes =
      parseInt(hours || "0", 10) * 60 + parseInt(minutes || "0", 10);

    const mappedTransport =
      transport === "conventional-ferry"
        ? "Ferry"
        : transport === "speed-boat"
        ? "Speedboat"
        : transport === "domestic-flight"
        ? "Flight"
        : "";

    const payload: AddRoutePayload = {
      transportType: mappedTransport as AddRoutePayload["transportType"],
      origin,
      destination,
      duration: totalMinutes,
    };

    try {
      await addRoute(payload);
      setOpen(false);
      router.refresh();
      toast({
        title: "Route added successfully!",
        description: `${origin} → ${destination} has been added.`,
      });
    } catch (error: any) {
      console.error("Error adding route:", error);
      toast({
        variant: "destructive",
        title: "Error adding route",
        description: error?.message ?? String(error),
      });
    }
  }

  return (
    <ReusableDialog
      open={open}
      onOpenChange={setOpen}
      title="Add new Route"
      description="Fill in the info below to create a schedule"
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Route
        </Button>
      }
      footer={
        <>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add route</Button>
        </>
      }
    >
      <div className="grid gap-6 py-4">
        <div className="flex flex-col gap-2">
          <Label>Transport type</Label>
          <div className="flex gap-2">
            <Button
              variant={
                transport === "conventional-ferry" ? "default" : "outline"
              }
              onClick={() => setTransport("conventional-ferry")}
            >
              <ShipWheel className="mr-2 h-4 w-4" />
              Conventional ferry
            </Button>
            <Button
              variant={transport === "speed-boat" ? "default" : "outline"}
              onClick={() => setTransport("speed-boat")}
            >
              <Ship className="mr-2 h-4 w-4" />
              Speed boat
            </Button>
            <Button
              variant={transport === "domestic-flight" ? "default" : "outline"}
              onClick={() => setTransport("domestic-flight")}
            >
              <Plane className="mr-2 h-4 w-4" />
              Domestic flight
            </Button>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex flex-col w-48 gap-2">
            <Label>Origin</Label>
            <Combobox
              options={originOptions}
              value={origin}
              onValueChange={setOrigin}
              placeholder="Select origin"
              className="w-full"
            />
          </div>

          <ArrowRight className="mb-3 h-5 w-5 text-gray-400" />

          <div className="flex flex-col w-48 gap-2">
            <Label>Destination</Label>
            <Combobox
              options={destinationOptions}
              value={destination}
              onValueChange={setDestination}
              placeholder="Select destination"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Duration (hours & minutes)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Hrs"
              min={0}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-20"
            />
            <span className="text-gray-500">:</span>
            <Input
              type="number"
              placeholder="Min"
              min={0}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </ReusableDialog>
  );
}

export default AddRouteDialog;
