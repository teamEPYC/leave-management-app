import type { User } from "~/routes/admin/user-management"; 

export const mockUsers: User[] = [
  {
    id: 1,
    name: "Utkarsh",
    email: "abd@email",
    role: "Owner",
    groups: ["Engineering"],
    status: "Active",
    leaves: ["1", "2", "3"],
  },
  {
    id: 2,
    name: "Manish",
    email: "kjhg@email",
    role: "Owner",
    groups: ["Engineering", "No-Code"],
    status: "Inactive",
    leaves: ["16", "32", "31"],
  },
  {
    id: 3,
    name: "Mishra",
    email: "abd@email",
    role: "Owner",
    groups: ["Engineering", "Leadership"],
    status: "Active",
    leaves: ["1", "2", "3"],
  },
  {
    id: 4,
    name: "Pizza",
    email: "abd@email",
    role: "Owner",
    groups: ["Engineering", "Leadership"],
    status: "Active",
  },
  {
    id: 5,
    name: "Jane Doe",
    email: "jane@example.com",
    role: "Employee",
    groups: ["Marketing"],
    status: "Inactive",
  },
];
