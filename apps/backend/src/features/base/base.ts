import { eq, and, SQL, AnyPgTable } from "drizzle-orm";
import { WithDbAndEnv } from "../../utils/commonTypes";
import { getUserFromApiKey } from "../auth/auth";
import { ErrorCodes } from "../../utils/error";

// Base response type matching your pattern
export type BaseResponse<T = any> = 
  | { ok: true; data: T }
  | { ok: false; error: string; errorCode?: string; status?: number };

// Configuration for the base repository
export interface BaseRepositoryConfig<TTable extends AnyPgTable> {
  table: TTable;
  primaryKey?: keyof TTable["_"]["columns"];
  requireAuth?: boolean; // default true
  softDelete?: boolean; // default true if isActive column exists
}

// Base repository class with generic types
export abstract class BaseRepository<
  TTable extends AnyPgTable,
  TRow = TTable["$inferSelect"],
  TInsert = TTable["$inferInsert"],
  TUpdate = Partial<TInsert>
> {
  protected table: TTable;
  protected primaryKey: keyof TTable["_"]["columns"];
  protected requireAuth: boolean;
  protected softDelete: boolean;

  constructor(config: BaseRepositoryConfig<TTable>) {
    this.table = config.table;
    this.primaryKey = config.primaryKey || ("id" as keyof TTable["_"]["columns"]);
    this.requireAuth = config.requireAuth ?? true;
    this.softDelete = config.softDelete ?? this.hasIsActiveColumn();
  }

  // Check if table has isActive column (for soft delete)
  private hasIsActiveColumn(): boolean {
    return "isActive" in this.table;
  }

  // Base auth helper
  protected async authenticate(params: WithDbAndEnv<{ apiKey: string }>) {
    if (!this.requireAuth) return { ok: true as const };
    
    const userRes = await getUserFromApiKey(params);
    if (!userRes.ok) {
      return { ok: false as const, error: userRes.error, errorCode: userRes.errorCode, status: 401 };
    }
    return { ok: true as const, user: userRes.user };
  }

  // Get by primary key
  async getById(params: WithDbAndEnv<{ 
    apiKey: string; 
    id: unknown 
  }>): Promise<BaseResponse<TRow | null>> {
    const authResult = await this.authenticate(params);
    if (!authResult.ok) return authResult;

    try {
      const conditions = [eq(this.table[this.primaryKey], params.id)];
      if (this.softDelete) {
        conditions.push(eq((this.table as any).isActive, true));
      }

      const [result] = await params.db
        .select()
        .from(this.table)
        .where(and(...conditions))
        .limit(1);

      return { ok: true, data: result || null };
    } catch (error: any) {
      return {
        ok: false,
        error: `Failed to fetch record: ${error.message}`,
        errorCode: ErrorCodes.DB_ERROR,
        status: 500,
      };
    }
  }

  // Find with custom conditions
  async find(params: WithDbAndEnv<{
    apiKey: string;
    where?: (table: TTable) => SQL | undefined;
    limit?: number;
    offset?: number;
  }>): Promise<BaseResponse<TRow[]>> {
    const authResult = await this.authenticate(params);
    if (!authResult.ok) return authResult;

    try {
      let query = params.db.select().from(this.table);

      // Build conditions
      const conditions: SQL[] = [];
      if (this.softDelete) {
        conditions.push(eq((this.table as any).isActive, true));
      }
      if (params.where) {
        const customCondition = params.where(this.table);
        if (customCondition) conditions.push(customCondition);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.offset(params.offset);
      }

      const results = await query;
      return { ok: true, data: results, total: results.length, filtered: results.length };
    } catch (error: any) {
      return {
        ok: false,
        error: `Failed to fetch records: ${error.message}`,
        errorCode: ErrorCodes.DB_ERROR,
        status: 500,
      };
    }
  }

  // Create new record
  async create(params: WithDbAndEnv<{
    apiKey: string;
    data: TInsert;
  }>): Promise<BaseResponse<TRow>> {
    const authResult = await this.authenticate(params);
    if (!authResult.ok) return authResult;

    try {
      const [result] = await params.db
        .insert(this.table)
        .values(params.data)
        .returning();

      return { ok: true, data: result };
    } catch (error: any) {
      return {
        ok: false,
        error: `Failed to create record: ${error.message}`,
        errorCode: ErrorCodes.DB_ERROR,
        status: 500,
      };
    }
  }

  // Update record
  async update(params: WithDbAndEnv<{
    apiKey: string;
    id: unknown;
    data: TUpdate;
  }>): Promise<BaseResponse<TRow>> {
    const authResult = await this.authenticate(params);
    if (!authResult.ok) return authResult;

    try {
      const conditions = [eq(this.table[this.primaryKey], params.id)];
      if (this.softDelete) {
        conditions.push(eq((this.table as any).isActive, true));
      }

      const updateData = { 
        ...params.data, 
        updatedAt: new Date() // Update timestamp
      };

      const [result] = await params.db
        .update(this.table)
        .set(updateData)
        .where(and(...conditions))
        .returning();

      if (!result) {
        return {
          ok: false,
          error: "Record not found or inactive",
          errorCode: ErrorCodes.NOT_FOUND,
          status: 404,
        };
      }

      return { ok: true, data: result };
    } catch (error: any) {
      return {
        ok: false,
        error: `Failed to update record: ${error.message}`,
        errorCode: ErrorCodes.DB_ERROR,
        status: 500,
      };
    }
  }

  // Delete record (soft or hard)
  async delete(params: WithDbAndEnv<{
    apiKey: string;
    id: unknown;
    hard?: boolean; // override soft delete
  }>): Promise<BaseResponse<{ deleted: boolean; id: unknown }>> {
    const authResult = await this.authenticate(params);
    if (!authResult.ok) return authResult;

    try {
      const useHardDelete = params.hard || !this.softDelete;
      
      if (useHardDelete) {
        // Hard delete
        await params.db
          .delete(this.table)
          .where(eq(this.table[this.primaryKey], params.id));
      } else {
        // Soft delete
        const [result] = await params.db
          .update(this.table)
          .set({ 
            isActive: false,
            updatedAt: new Date()
          } as any)
          .where(and(
            eq(this.table[this.primaryKey], params.id),
            eq((this.table as any).isActive, true)
          ))
          .returning();

        if (!result) {
          return {
            ok: false,
            error: "Record not found or already inactive",
            errorCode: ErrorCodes.NOT_FOUND,
            status: 404,
          };
        }
      }

      return { ok: true, data: { deleted: true, id: params.id } };
    } catch (error: any) {
      return {
        ok: false,
        error: `Failed to delete record: ${error.message}`,
        errorCode: ErrorCodes.DB_ERROR,
        status: 500,
      };
    }
  }
}

// ===================================================================
// Example: GroupRepository extending BaseRepository
// ===================================================================

import { GroupTable, LeaveTypeTable } from "../db/schema";

export class GroupRepository extends BaseRepository<
  typeof GroupTable,
  typeof GroupTable.$inferSelect,
  typeof GroupTable.$inferInsert,
  Partial<typeof GroupTable.$inferInsert>
> {
  constructor() {
    super({
      table: GroupTable,
      primaryKey: "id",
      requireAuth: true,
      softDelete: true,
    });
  }

  // Custom method: get group by name in organization
  async getByName(params: WithDbAndEnv<{
    apiKey: string;
    organizationId: string;
    name: string;
  }>): Promise<BaseResponse<typeof GroupTable.$inferSelect | null>> {
    const result = await this.find({
      ...params,
      where: (t) => and(
        eq(t.organizationId, params.organizationId),
        eq(t.name, params.name)
      ),
      limit: 1,
    });

    if (!result.ok) return result;
    
    return { 
      ok: true, 
      data: result.data.length > 0 ? result.data[0] : null 
    };
  }

  // Custom method: list groups for organization
  async listForOrganization(params: WithDbAndEnv<{
    apiKey: string;
    organizationId: string;
  }>): Promise<BaseResponse<typeof GroupTable.$inferSelect[]>> {
    return this.find({
      ...params,
      where: (t) => eq(t.organizationId, params.organizationId),
    });
  }

  // Custom method: create group with validation
  async createGroup(params: WithDbAndEnv<{
    apiKey: string;
    data: typeof GroupTable.$inferInsert;
  }>): Promise<BaseResponse<typeof GroupTable.$inferSelect>> {
    // Check if group name already exists in organization
    const existing = await this.getByName({
      db: params.db,
      env: params.env,
      apiKey: params.apiKey,
      organizationId: params.data.organizationId,
      name: params.data.name,
    });

    if (!existing.ok) return existing;
    
    if (existing.data) {
      return {
        ok: false,
        error: "Group name already exists in this organization",
        errorCode: ErrorCodes.ALREADY_EXISTS,
        status: 409,
      };
    }

    // Create the group
    return this.create(params);
  }
}

export class LeaveTypeRepository extends BaseRepository<
  typeof LeaveTypeTable,
  typeof LeaveTypeTable.$inferSelect,
  typeof LeaveTypeTable.$inferInsert,
  Partial<typeof LeaveTypeTable.$inferInsert>
> {

  constructor() {
    super({
      table: LeaveTypeTable,
      primaryKey: "id",
      requireAuth: true,
      softDelete: true,
    });
  }
}



const groupRepository = new GroupRepository();

