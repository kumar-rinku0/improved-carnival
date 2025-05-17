import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import Teams from "@/components/settings/teams/teams";
import AddUser from "@/components/settings/teams/adduser";

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
            <AddUser />
          </DialogContent>
        </Dialog>
      </div>

      <Teams />
    </div>
  );
};

export default TeamsPage;
