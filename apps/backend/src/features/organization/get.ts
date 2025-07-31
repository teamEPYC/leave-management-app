import { OrganizationTable } from "../db/schema";
import { WithDb } from "../../utils/commonTypes";
import { eq, and } from "drizzle-orm";

export async function getOrganizationList({
    db,
    email,
}: WithDb<{ email: string }>) {
    const domain = email.split("@")[1].toLowerCase().trim();

    const organizations = await db
        .select({
            id: OrganizationTable.id,
            name: OrganizationTable.name,
            description: OrganizationTable.description,
            domain: OrganizationTable.domain,
            icon: OrganizationTable.icon,
        })
        .from(OrganizationTable)
        .where(
            and(
                eq(OrganizationTable.domain, domain),
                eq(OrganizationTable.isActive, true)
            )
        );

    return organizations;
}
