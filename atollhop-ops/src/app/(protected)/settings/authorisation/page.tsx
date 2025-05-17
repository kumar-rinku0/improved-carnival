import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, PlusCircle } from "lucide-react";
import AddRole from "@/components/settings/authorisation/addrole";

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
  // const permissionsList = ["Create", "Read", "Update", "Delete"];
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
            <AddRole />
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
