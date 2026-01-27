import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";
import bcrypt from "bcryptjs";

type User = Database["public"]["Tables"]["users"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
type UserRole = Database["public"]["Enums"]["user_role"];

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
  bio?: string;
}

export interface UpdateUserData {
  name?: string;
  bio?: string;
  avatar?: string;
}

export interface ListUsersFilters {
  role?: UserRole;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * User service for managing user operations
 */
export class UserService {
  /**
   * Create a new user
   * Uses admin client to bypass RLS
   */
  static async createUser(
    data: CreateUserData,
  ): Promise<{ user?: User; error?: string }> {
    try {
      const admin = createAdminClient();

      // Check if user already exists
      const { data: existing } = await (admin.from("users") as any)
        .select("id")
        .eq("email", data.email.toLowerCase())
        .single();

      if (existing) {
        return { error: "User with this email already exists" };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const { data: userRaw, error } = await (admin.from("users") as any)
        .insert({
          email: data.email.toLowerCase(),
          name: data.name,
          password: hashedPassword,
          role: data.role || "student",
          bio: data.bio,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = userRaw as any;

      return { user };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to create user",
      };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(
    id: string,
  ): Promise<{ user?: User; error?: string }> {
    try {
      const supabase = createClient();

      const { data: userRaw, error } = await (supabase.from("users") as any)
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = userRaw as any;

      return { user };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to fetch user",
      };
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(
    email: string,
  ): Promise<{ user?: User; error?: string }> {
    try {
      const admin = createAdminClient();

      const { data: userRaw, error } = await (admin.from("users") as any)
        .select("*")
        .eq("email", email.toLowerCase())
        .is("deleted_at", null)
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = userRaw as any;

      return { user };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to fetch user",
      };
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    id: string,
    data: UpdateUserData,
  ): Promise<{ user?: User; error?: string }> {
    try {
      const supabase = createClient();

      const { data: userRaw, error } = await (supabase.from("users") as any)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = userRaw as any;

      return { user };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to update user",
      };
    }
  }

  /**
   * Update user avatar
   */
  static async updateAvatar(
    id: string,
    avatarUrl: string,
  ): Promise<{ user?: User; error?: string }> {
    return await this.updateUser(id, { avatar: avatarUrl });
  }

  /**
   * Soft delete user
   */
  static async deleteUser(
    id: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const admin = createAdminClient();

      const { error } = await (admin.from("users") as any)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete user",
      };
    }
  }

  /**
   * List users with filters and pagination
   */
  static async listUsers(
    filters?: ListUsersFilters,
    pagination?: PaginationOptions,
  ): Promise<{ users: User[]; total: number; error?: string }> {
    try {
      const admin = createAdminClient();
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const offset = (page - 1) * limit;

      let query = (admin.from("users") as any)
        .select("*", { count: "exact" })
        .is("deleted_at", null);

      // Apply filters
      if (filters?.role) {
        query = query.eq("role", filters.role);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`,
        );
      }

      // Apply pagination
      query = query
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false });

      const { data: usersRaw, count, error } = await query;

      if (error) {
        return { users: [], total: 0, error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = (usersRaw as any[]) || [];

      return { users, total: count || 0 };
    } catch (error) {
      return {
        users: [],
        total: 0,
        error: error instanceof Error ? error.message : "Failed to list users",
      };
    }
  }

  /**
   * Verify user password
   */
  static async verifyPassword(
    email: string,
    password: string,
  ): Promise<{ valid: boolean; user?: User }> {
    try {
      const { user } = await this.getUserByEmail(email);

      if (!user) {
        return { valid: false };
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return { valid: false };
      }

      return { valid: true, user };
    } catch (error) {
      return { valid: false };
    }
  }
  /**
   * Count total users (optional role filter)
   */
  static async countUsers(
    role?: UserRole,
  ): Promise<{ count: number; error?: string }> {
    try {
      // Use admin client to count all users (including those not visible to anon if RLS applied strictly)
      const admin = createAdminClient();
      let query = (admin.from("users") as any)
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);

      if (role) {
        query = query.eq("role", role);
      }

      const { count, error } = await query;

      if (error) {
        return { count: 0, error: error.message };
      }

      return { count: count || 0 };
    } catch (error) {
      return {
        count: 0,
        error: error instanceof Error ? error.message : "Failed to count users",
      };
    }
  }
}
