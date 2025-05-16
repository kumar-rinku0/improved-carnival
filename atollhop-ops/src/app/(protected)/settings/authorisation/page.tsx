import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, PlusCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const roles = [
  {
    name: "Admin",
    description: "The super admin that have full access to platform",
    users: 32,
    permissions: 39,
  },
  {
    name: "Viewer",
    description: "The super admin that have full access to platform",
    users: 32,
    permissions: 39,
  },
  {
    name: "Manager",
    description: "The super admin that have full access to platform",
    users: 32,
    permissions: 39,
  },
  {
    name: "Admin",
    description: "The super admin that have full access to platform",
    users: 32,
    permissions: 39,
  },
  {
    name: "Member",
    description: "The super admin that have full access to platform",
    users: 32,
    permissions: 39,
  },
];

const Authorisation = () => {
  const permissionsList = ["Create", "Read", "Update", "Delete"];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Authorisation Roles</h1>
          <p className="text-sm text-muted-foreground">Search groups</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">+ Create a new role</Button>
          </DialogTrigger>
          <DialogContent>
            <form
              className="space-y-4 mt-4 bg-white rounded"
              // onSubmit={handleSubmit}
            >
              <DialogHeader>
                <DialogTitle>Create a new role</DialogTitle>
                <DialogDescription>
                  Configure permissions for the new role.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label>Name</Label>
                  <Input placeholder="Permission Name" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Description</Label>
                  <Input placeholder="Describe the permission" />
                </div>

                <div>
                  <Label className="mb-2 block">Permissions</Label>
                  <Tabs defaultValue="Schedules">
                    <TabsList className="mb-3">
                      {[
                        "Routes",
                        "Schedules",
                        "Trips",
                        "Bookings",
                        "Settings",
                      ].map((tab) => (
                        <TabsTrigger key={tab} value={tab}>
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {[
                      "Routes",
                      "Schedules",
                      "Trips",
                      "Bookings",
                      "Settings",
                    ].map((tab) => (
                      <TabsContent key={tab} value={tab}>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          {permissionsList.map((perm) => (
                            <div
                              key={perm}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={perm}
                                // checked={selectedPermissions.includes(perm)}
                                // onCheckedChange={() => togglePermission(perm)}
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
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{role.name}</CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-x-2">
                  <Badge variant="secondary">
                    {role.users} User{role.users !== 1 ? "s" : ""}
                  </Badge>
                  <Badge variant="secondary">
                    {role.permissions} Permission
                    {role.permissions !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  View details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card
          key={"new role"}
          className="border-dashed border-2 border-gray-300 rounded-lg cursor-pointer"
        >
          <CardContent className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center gap-2 h-full">
              <PlusCircle size={64} className="text-gray-500" />
              <Badge variant="secondary">Create a new role</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <RolesDialog isOpen={isDialogOpen} closeDialog={closeDialog} /> */}
    </div>
  );
};

export default Authorisation;
