# 🚀 API Integration Patterns Guide

## ⚠️ **Important: React Router v7 Required**

This guide is designed for **React Router v7**. The patterns emphasize using **loaders and actions** instead of `useEffect` for data fetching and mutations.

## 📋 **Overview**

This guide establishes **standard patterns** for integrating backend APIs with frontend components across all modules. Following these patterns ensures consistency, maintainability, and reduces development time.

## 🎯 **Core Principles**

1. **React Router v7 First** - Use loaders and actions instead of useEffect for data fetching
2. **Consistent Error Handling** - All API calls follow the same error pattern
3. **Standardized Loading States** - Uniform loading indicators across components
4. **Type-Safe API Responses** - Proper TypeScript interfaces for all responses
5. **Centralized API Client** - Single source of truth for API calls
6. **Reusable Components** - Common UI patterns for similar functionality

---

## 🏗️ **1. API Client Pattern**

### **Standard API Function Structure**

```typescript
export async function apiFunctionName(
  params: FunctionParams,
  apiKey: string
): Promise<{
  ok: boolean;
  data?: ResponseDataType;
  error?: string;
}> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/endpoint`, {
      method: "HTTP_METHOD",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params), // For POST/PUT requests
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      ok: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error in apiFunctionName:", error);
    return {
      ok: false,
      error: "Network error or unexpected failure",
    };
  }
}
```

### **Usage Example**

```typescript
// In your component
const handleSubmit = async () => {
  const result = await apiFunctionName(params, apiKey);

  if (result.ok && result.data) {
    // Handle success
    setData(result.data);
  } else {
    // Handle error
    setError(result.error);
  }
};
```

---

## 🔄 **2. State Management Pattern**

### **Standard Component State Structure**

```typescript
interface ComponentState {
  // Data state
  data: DataType | null;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;

  // Error states
  error: string | null;

  // UI state
  isOpen: boolean;
  selectedItem: string | null;
}

// Initial state
const initialState: ComponentState = {
  data: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  isOpen: false,
  selectedItem: null,
};
```

### **State Update Pattern**

```typescript
const [state, setState] = useState<ComponentState>(initialState);

// Update specific state properties
const updateState = (updates: Partial<ComponentState>) => {
  setState((prev) => ({ ...prev, ...updates }));
};

// Example usage
const fetchData = async () => {
  updateState({ isLoading: true, error: null });

  try {
    const result = await apiFunction(params, apiKey);

    if (result.ok && result.data) {
      updateState({ data: result.data, isLoading: false });
    } else {
      updateState({ error: result.error, isLoading: false });
    }
  } catch (error) {
    updateState({ error: "Unexpected error", isLoading: false });
  }
};
```

---

## 🎨 **3. Loading States Pattern**

### **Standard Loading Components**

```typescript
// Skeleton Loader for Tables
export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Button Loading State
export function LoadingButton({
  isLoading,
  children,
  ...props
}: ButtonProps & { isLoading: boolean }) {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
```

### **Usage in Components**

```typescript
// In your component
{
  isLoading ? (
    <TableSkeleton />
  ) : error ? (
    <ErrorMessage error={error} />
  ) : (
    <DataTable data={data} />
  );
}
```

---

## ⚠️ **4. Error Handling Pattern**

### **Standard Error Response Interface**

```typescript
interface ApiError {
  ok: false;
  error: string;
  statusCode?: number;
  details?: Record<string, any>;
}

interface ApiSuccess<T> {
  ok: true;
  data: T;
}
```

### **Error Display Components**

```typescript
// Inline Error Message
export function InlineError({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
      <ExclamationTriangleIcon className="h-4 w-4 inline mr-2" />
      {error}
    </div>
  );
}

// Toast Error Notification
export function showErrorToast(error: string) {
  toast({
    title: "Error",
    description: error,
    variant: "destructive",
  });
}
```

### **Error Handling in API Calls**

```typescript
const handleApiCall = async () => {
  try {
    const result = await apiFunction(params, apiKey);

    if (!result.ok) {
      // Handle different error types
      if (result.statusCode === 401) {
        // Unauthorized - redirect to login
        redirectToLogin();
      } else if (result.statusCode === 403) {
        // Forbidden - show permission error
        setError("You don't have permission to perform this action");
      } else {
        // General error
        setError(result.error);
      }
      return;
    }

    // Handle success
    handleSuccess(result.data);
  } catch (error) {
    // Network or unexpected errors
    setError("Network error. Please try again.");
  }
};
```

---

## 🔄 **5. Data Fetching Pattern**

### **⚠️ DEPRECATED: useEffect Pattern (React Router v6 and earlier)**

**Note**: This pattern is deprecated for new development. Use React Router v7 loaders and actions instead.

```typescript
// Standard data fetching hook
export function useDataFetching<T>(
  fetchFunction: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<{
    data: T | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetchFunction();

      if (result.ok && result.data) {
        setState({ data: result.data, isLoading: false, error: null });
      } else {
        setState({ data: null, isLoading: false, error: result.error });
      }
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: "Failed to fetch data",
      });
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { ...state, refetch: fetchData };
}
```

### **Usage Example**

````typescript
function MyComponent({ apiKey }: { apiKey: string }) {
  const { data, isLoading, error, refetch } = useDataFetching(
    () => fetchMyData(apiKey),
    [apiKey]
  );

  if (isLoading) return <TableSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} onRefresh={refetch} />;
}

---

### **✅ RECOMMENDED: React Router v7 Loaders and Actions Pattern**

React Router v7 provides a more efficient and declarative way to handle data fetching and mutations.

#### **Loader Pattern for Data Fetching**

```typescript
// In your route file (e.g., groups-management.tsx)
export async function loader({ request }: LoaderFunctionArgs) {
  const apiKey = getApiKeyFromRequest(request);

  try {
    const groupsResponse = await getGroups({ apiKey });
    const usersResponse = await listUsers(apiKey);

    if (!groupsResponse.ok || !usersResponse.ok) {
      throw new Error('Failed to fetch initial data');
    }

    return {
      groups: groupsResponse.data,
      users: usersResponse.data,
      apiKey,
    };
  } catch (error) {
    throw new Error('Failed to load groups management data');
  }
}
````

#### **Action Pattern for Data Mutations**

```typescript
// In your route file
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const apiKey = getApiKeyFromRequest(request);

  try {
    const result = await createGroup({
      organizationId: formData.get("organizationId") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      apiKey,
    });

    if (result.ok) {
      return redirect("/admin/groups-management");
    } else {
      return json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return json({ error: "Failed to create group" }, { status: 500 });
  }
}
```

#### **Component Usage with Loader Data**

```typescript
// In your component
import { useLoaderData } from "react-router-dom";

function GroupsManagementPage() {
  const { groups, users, apiKey } = useLoaderData<typeof loader>();

  // No useEffect needed! Data is already available
  // No loading states to manage manually

  return (
    <div>
      <GroupsTable groups={groups} />
      <UsersList users={users} />
    </div>
  );
}
```

#### **Benefits of Loaders and Actions**

1. **No useEffect needed** - Data is fetched before component renders
2. **Automatic loading states** - React Router handles loading UI
3. **Better error boundaries** - Centralized error handling
4. **Improved performance** - Data fetching happens in parallel
5. **Better UX** - No loading spinners after initial load
6. **Type safety** - Loader data is fully typed

---

### **🔄 Migration Guide: From useEffect to Loaders**

#### **Before (useEffect Pattern)**

```typescript
function GroupDetailsSheet({ group, apiKey }: Props) {
  const [groupDetails, setGroupDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (group && apiKey) {
      fetchGroupDetails();
    }
  }, [group, apiKey]);

  const fetchGroupDetails = async () => {
    setIsLoading(true);
    const result = await getGroupDetails(group.id, apiKey);
    setGroupDetails(result.data);
    setIsLoading(false);
  };

  // Component logic...
}
```

#### **After (Loader Pattern)**

```typescript
// In route file
export async function loader({ params, request }: LoaderFunctionArgs) {
  const apiKey = getApiKeyFromRequest(request);
  const groupId = params.groupId;

  const result = await getGroupDetails(groupId, apiKey);
  if (!result.ok) throw new Error(result.error);

  return { groupDetails: result.data, apiKey };
}

// In component
function GroupDetailsSheet() {
  const { groupDetails, apiKey } = useLoaderData<typeof loader>();

  // No useEffect, no loading states, data is ready!
  return <GroupMemberManager groupDetails={groupDetails} />;
}
```

#### **When to Use Each Pattern**

| Pattern                     | Use Case                    | Example                           |
| --------------------------- | --------------------------- | --------------------------------- |
| **Loaders**                 | Initial data fetching       | Page load, route navigation       |
| **Actions**                 | Form submissions, mutations | Create, update, delete operations |
| **useEffect**               | Side effects, subscriptions | Event listeners, timers, cleanup  |
| **useState + manual fetch** | User-triggered actions      | Search, filters, pagination       |

````

---

## 🎯 **6. Form Handling Pattern**

### **Standard Form State Management**

```typescript
interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

function useFormState<T>(initialData: T) {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isDirty: false,
  });

  const updateField = (field: keyof T, value: any) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: undefined },
    }));
  };

  const setErrors = (errors: Partial<Record<keyof T, string>>) => {
    setState((prev) => ({ ...prev, errors }));
  };

  const setSubmitting = (isSubmitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting }));
  };

  return {
    ...state,
    updateField,
    setErrors,
    setSubmitting,
  };
}
````

### **Form Submission Pattern**

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  // Clear previous errors
  setErrors({});

  // Validate form
  const validationErrors = validateForm(state.data);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  // Submit form
  setSubmitting(true);

  try {
    const result = await submitForm(state.data, apiKey);

    if (result.ok) {
      // Handle success
      onSuccess(result.data);
      resetForm();
    } else {
      // Handle API errors
      if (result.fieldErrors) {
        setErrors(result.fieldErrors);
      } else {
        setErrors({ general: result.error });
      }
    }
  } catch (error) {
    setErrors({ general: "Network error. Please try again." });
  } finally {
    setSubmitting(false);
  }
};
```

---

## 🔧 **7. Reusable Component Patterns**

### **Data Table Pattern**

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  error?: string | null;
  onRowClick?: (item: T) => void;
  actions?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  if (isLoading) return <TableSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data.length) return <EmptyState />;

  return (
    <div className="space-y-4">
      {actions && <div className="flex justify-end">{actions}</div>}
      <Table>
        <TableHeader>
          {columns.map((column) => (
            <TableHead key={column.id}>{column.header}</TableHead>
          ))}
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={index}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
            >
              {columns.map((column) => (
                <TableCell key={column.id}>{column.cell(item)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### **Modal/Dialog Pattern**

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-${
          size === "sm"
            ? "sm"
            : size === "lg"
            ? "lg"
            : size === "xl"
            ? "xl"
            : "md"
        }`}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📚 **8. Implementation Checklist**

### **For Each New Module:**

- [ ] **Create API client functions** following the standard pattern
- [ ] **Define TypeScript interfaces** for all API responses
- [ ] **Implement loading states** using skeleton components
- [ ] **Add error handling** with proper error boundaries
- [ ] **Use standard state management** patterns
- [ ] **Create reusable components** for common UI patterns
- [ ] **Add proper validation** for forms and inputs
- [ ] **Implement optimistic updates** where appropriate
- [ ] **Add proper accessibility** attributes
- [ ] **Write component documentation** following the README pattern

---

## 🎯 **9. Best Practices Summary**

1. **Always use the standard API client pattern** - ensures consistency
2. **Implement loading states** - never leave users wondering
3. **Handle errors gracefully** - provide clear feedback
4. **Use TypeScript interfaces** - catch errors at compile time
5. **Create reusable components** - don't repeat yourself
6. **Follow the state management pattern** - predictable behavior
7. **Add proper validation** - prevent invalid data submission
8. **Document your components** - help other developers

---

## 🔗 **Related Documentation**

- [API Client Patterns](./API_CLIENT_PATTERNS.md)
- [State Management Guide](./STATE_MANAGEMENT.md)
- [Error Handling Guide](./ERROR_HANDLING.md)
- [Component Library](./../shared/README.md)

---

_This guide should be updated whenever new patterns are established or existing ones are improved._
