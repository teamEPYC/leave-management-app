import { WithDbAndEnv } from "../../utils/commonTypes";
import { UserTable } from "../db/schema";

export async function requireUserToExist({
    db,
    apiKey,
    env,
}: WithDbAndEnv<{ apiKey: string }>) {
    const user = await db.select().from(UserTable).where(eq(UserTable.apiKey, apiKey));
    if (user.length === 0) {
        return {
            ok: false,
            errorCode: ErrorCodes.INVALID_API_KEY,
            error: "Invalid API key",
        } as const;
    }
}

export async function requireUser({
    db,
    apiKey,
    env,
}: WithDbAndEnv<{ apiKey: string }>) {
    return requireUserToExist({ db, apiKey, env });
}