"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";

type ShowPasswordProp = {
  showOld: boolean;
  showNew: boolean;
  showConfirm: boolean;
};

export default function General() {
  const [showPassword, setShowPassword] = useState<ShowPasswordProp>({
    showOld: false,
    showNew: false,
    showConfirm: false,
  });
  const handleUpdateShowPassword = (type: keyof ShowPasswordProp) => {
    setShowPassword((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };
  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const obj = Object.fromEntries(formData.entries());
    console.log("Form Data:", obj);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Omar Riad</h2>
            <Badge variant="outline" className="text-xs py-0.5 px-2">
              Admin
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your photo and personal details.
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Password & security</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications & Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                <Label htmlFor="displayName" className="text-sm font-medium">
                  Display Name *
                </Label>
                <Input
                  id="displayName"
                  defaultValue="Omar Riad"
                  className="md:col-span-1"
                />
                <Button variant="outline">Change</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  defaultValue="Example@email.com"
                  className="md:col-span-1"
                />
                <Button variant="outline">Change</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword" className="text-sm font-medium">
                    Old Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      name="oldPassword"
                      type={showPassword.showOld ? "text" : "password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateShowPassword("showOld")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword.showOld ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    New Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword.showNew ? "text" : "password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateShowPassword("showNew")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword.showNew ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword.showConfirm ? "text" : "password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateShowPassword("showConfirm")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword.showConfirm ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <Button className="mt-4" variant="default">
                  Reset password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notifications & Preferences</CardTitle>
            </CardHeader>
            <CardContent>{/* Notifications content here */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
