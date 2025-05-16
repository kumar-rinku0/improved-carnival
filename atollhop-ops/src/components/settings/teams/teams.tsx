import { User, columns } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<User[]> {
  // Fetch data from your API here.
  return [
    {
      _id: "728ed52f",
      name: "John Doe",
      permissions: "Read, Write",
      status: "Pending",
      email: "m@example.com",
      role: "Admin",
    },
    {
      _id: "728ed52f",
      name: "Jane Smith",
      permissions: "Read, Write, Delete",
      status: "Active",
      email: "smith@gmail.com",
      role: "Manager",
    },
    // ...
  ];
}

export default async function Teams() {
  const data = await getData();

  return <DataTable columns={columns} data={data} />;
}
