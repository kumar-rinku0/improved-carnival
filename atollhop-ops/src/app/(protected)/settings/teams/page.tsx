import { Button } from "@/components/ui/button";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Teams from "@/components/settings/teams/teams";

const TeamsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>+ Add a new user</Button>
          </DialogTrigger>
          <DialogContent>
            <form
              className="space-y-4 mt-4 bg-white rounded"
              // onSubmit={handleSubmit}
            >
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new user to your team.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-1"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <Label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-1"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="role"
                  className="block text-sm font-medium mb-1"
                >
                  Role
                </Label>
                <Select name="role">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Add User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Teams />
    </div>
  );
};

export default TeamsPage;
