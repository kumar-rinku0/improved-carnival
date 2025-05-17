"use client";

import React from "react";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const AddRole = () => {
  const permissionsList = ["Create", "Read", "Update", "Delete"];
  const tablist = ["Routes", "Schedules", "Trips", "Bookings", "Settings"];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const obj = Object.fromEntries(formData.entries());
    console.log("Form Data:", obj);
    // Handle form submission logic here
  };

  return (
    <form className="space-y-4 mt-4 bg-white rounded" onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create a new role</DialogTitle>
        <DialogDescription>
          Configure permissions for the new role.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label>Name</Label>
          <Input placeholder="Permission Name" name="name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Description</Label>
          <Input placeholder="Describe the permission" name="description" />
        </div>

        <div>
          <Label className="mb-2 block">Permissions</Label>
          <Tabs defaultValue="Schedules">
            <TabsList className="mb-3">
              {tablist.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            {tablist.map((tab) => (
              <TabsContent key={tab} value={tab}>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {permissionsList.map((perm) => (
                    <div key={perm} className="flex items-center space-x-2">
                      <Checkbox
                        id={perm}
                        name={perm.toLocaleLowerCase() + tab} // Unique name for each permission in each tab [camelCase]
                      />
                      <Label htmlFor={perm}>
                        {perm}
                        <span className="text-gray-500">{tab}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Next</Button>
      </DialogFooter>
    </form>
  );
};

export default AddRole;
