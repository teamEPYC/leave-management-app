import { redirect, type LoaderFunctionArgs } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";

interface Org {
  id: string;
  name: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get("apiKey");
  const userParam = url.searchParams.get("user");

  if (!apiKey || !userParam) {
    return redirect("/");
  }

  // You can parse the user param here if you need
  const user = JSON.parse(decodeURIComponent(userParam));

  // TODO: fetch org list from backend using apiKey
  // For now we’ll just return an empty array
  return { orgs: [] as Org[], user, apiKey };
}

export default function SelectOrgPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);

  return (
    <div>
      <h1>Select or Create an Organization</h1>
      {orgs.length === 0 ? (
        <p>
          No organizations yet. <Link to="/orgs/create">Create one</Link>
        </p>
      ) : (
        orgs.map((o: Org) => (
          <div key={o.id}>
            <span>{o.name}</span>
            <Link to={`/orgs/${o.id}`}>Join</Link>
          </div>
        ))
      )}
    </div>
  );
}
